import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

function getDeviceId() {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('device_id', id)
  }
  return id
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function FutureVoting({ era }) {
  const [voteTallies, setVoteTallies] = useState({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [myVote, setMyVote] = useState(null)
  const [voting, setVoting] = useState(false)
  const [pledges, setPledges] = useState([])
  const [pledgeCount, setPledgeCount] = useState(0)
  const [pledgeText, setPledgeText] = useState('')
  const [pledgeName, setPledgeName] = useState('')
  const [pledging, setPledging] = useState(false)
  const [pledgeSuccess, setPledgeSuccess] = useState(false)
  const [voices, setVoices] = useState([])

  const scenarios = era.future_scenarios || []
  const deviceId = getDeviceId()

  const fetchData = useCallback(async () => {
    if (!era?.id) return

    // Fetch vote tallies
    const { data: tallyData } = await supabase
      .from('future_vote_tallies')
      .select('*')
      .eq('era_id', era.id)
      .catch(() => ({ data: null }))

    if (tallyData) {
      const tallies = {}
      let total = 0
      tallyData.forEach((t) => {
        tallies[t.scenario_id] = t.vote_count
        total += t.vote_count
      })
      setVoteTallies(tallies)
      setTotalVotes(total)
    }

    // Fetch my vote
    const { data: myVoteData } = await supabase
      .from('future_votes')
      .select('scenario_id')
      .eq('era_id', era.id)
      .eq('device_id', deviceId)
      .limit(1)
      .catch(() => ({ data: null }))

    if (myVoteData && myVoteData.length > 0) {
      setMyVote(myVoteData[0].scenario_id)
    } else {
      setMyVote(null)
    }

    // Fetch pledges
    const { data: pledgeData, count: pCount } = await supabase
      .from('pledges')
      .select('*', { count: 'exact' })
      .eq('era_id', era.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .catch(() => ({ data: null, count: 0 }))

    if (pledgeData) {
      setPledges(pledgeData)
      setPledgeCount(pCount || 0)
    }

    // Fetch voices (votes with messages)
    const { data: voiceData } = await supabase
      .from('future_votes')
      .select('*')
      .eq('era_id', era.id)
      .not('message', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5)
      .catch(() => ({ data: null }))

    if (voiceData) {
      setVoices(voiceData)
    }
  }, [era?.id, deviceId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleVote = useCallback(async (scenarioId) => {
    if (voting) return
    setVoting(true)

    try {
      const { error } = await supabase
        .from('future_votes')
        .upsert({
          era_id: era.id,
          scenario_id: scenarioId,
          device_id: deviceId,
          author_name: 'Anonymous',
        }, { onConflict: 'era_id,device_id' })

      if (!error) {
        setMyVote(scenarioId)
        await fetchData()
      }
    } catch {
      // Silent fail
    } finally {
      setVoting(false)
    }
  }, [voting, era?.id, deviceId, fetchData])

  const handlePledge = useCallback(async () => {
    if (pledging || !pledgeText.trim()) return
    setPledging(true)

    try {
      const { error } = await supabase
        .from('pledges')
        .insert({
          era_id: era.id,
          device_id: deviceId,
          author_name: (pledgeName || 'Anonymous').slice(0, 50),
          pledge_text: pledgeText.slice(0, 200),
        })

      if (!error) {
        setPledgeSuccess(true)
        setPledgeText('')
        setPledgeName('')
        await fetchData()
        setTimeout(() => setPledgeSuccess(false), 1500)
      }
    } catch {
      // Silent fail
    } finally {
      setPledging(false)
    }
  }, [pledging, pledgeText, pledgeName, era?.id, deviceId, fetchData])

  if (scenarios.length === 0) return null

  return (
    <div className="mt-5 space-y-5">
      {/* Header */}
      <div>
        <span className="font-ui text-[10px] tracking-[0.2em] text-past/60 uppercase">
          The future is unwritten
        </span>
      </div>

      {/* Scenario cards */}
      {scenarios.map((scenario) => {
        const votes = voteTallies[scenario.id] || 0
        const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
        const isMyVote = myVote === scenario.id

        return (
          <div
            key={scenario.id}
            className="rounded-sm border border-border bg-background/50 p-4"
          >
            <h4 className="font-ui text-sm font-medium text-present">
              {scenario.label}
            </h4>
            <span className="font-ui text-[11px] text-present/40">
              {scenario.sublabel}
            </span>

            {/* Vote bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full rounded-full bg-past"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-past/70">
                {pct}%
              </span>
              <span className="font-ui text-[10px] text-present/30">
                {votes} {votes === 1 ? 'person thinks' : 'people think'} this happens
              </span>
            </div>

            {/* Description */}
            <p className="mt-2 font-ui text-xs leading-relaxed text-present/50 line-clamp-3">
              {scenario.description}
            </p>

            {/* Vote button */}
            <button
              onClick={() => handleVote(scenario.id)}
              disabled={voting}
              className={`mt-3 w-full cursor-pointer rounded-sm border py-2 font-ui text-[11px] font-medium tracking-[0.15em] uppercase transition-colors disabled:opacity-40 ${
                isMyVote
                  ? 'border-past/50 bg-past/20 text-past'
                  : 'border-border bg-background text-present/40 hover:border-present/20 hover:text-present/60'
              }`}
            >
              {isMyVote ? '✓ Your vote' : 'This happens'}
            </button>
          </div>
        )
      })}

      {/* Pledge section */}
      <div className="border-t border-border pt-4">
        <span className="font-ui text-[10px] tracking-[0.2em] text-present/40 uppercase">
          What will you do about it?
        </span>

        <AnimatePresence>
          {pledgeSuccess && (
            <motion.div
              className="mt-2 flex items-center gap-2 rounded-sm border border-past/30 bg-past/10 px-3 py-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 3.5L5.5 10 2.5 7" />
              </svg>
              <span className="font-ui text-xs text-past">Pledge recorded.</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Your name"
            maxLength={50}
            value={pledgeName}
            onChange={(e) => setPledgeName(e.target.value)}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-ui text-sm text-present placeholder:text-present/25 outline-none focus:border-past/40"
          />
          <div className="flex gap-2">
            <span className="shrink-0 pt-2 font-ui text-sm text-present/40">I will...</span>
            <input
              type="text"
              placeholder="take action"
              maxLength={200}
              value={pledgeText}
              onChange={(e) => setPledgeText(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 font-ui text-sm text-present placeholder:text-present/25 outline-none focus:border-past/40"
            />
          </div>
          <button
            onClick={handlePledge}
            disabled={pledging || !pledgeText.trim()}
            className="w-full cursor-pointer rounded-sm border border-past/40 bg-past/15 py-2.5 font-ui text-[11px] font-medium tracking-[0.15em] text-past uppercase transition-colors hover:bg-past/25 disabled:opacity-40"
          >
            {pledging ? 'Pledging...' : 'Pledge'}
          </button>
        </div>

        {pledgeCount > 0 && (
          <p className="mt-2 font-ui text-[10px] text-present/30">
            {pledgeCount} {pledgeCount === 1 ? 'person has' : 'people have'} pledged to act
          </p>
        )}

        {pledges.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {pledges.map((p) => (
              <div key={p.id} className="rounded-sm border border-border bg-background/30 px-3 py-2">
                <span className="font-ui text-xs font-medium text-present/60">
                  {p.author_name}
                </span>
                <p className="font-ui text-xs text-present/40">
                  I will {p.pledge_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voices feed */}
      {voices.length > 0 && (
        <div className="border-t border-border pt-4">
          <span className="font-ui text-[10px] tracking-[0.2em] text-present/40 uppercase">
            What people are saying
          </span>
          <div className="mt-2 space-y-1.5">
            {voices.map((v) => (
              <div key={v.id} className="rounded-sm border border-border bg-background/30 px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-ui text-xs font-medium text-present/60">
                    {v.author_name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-present/20">
                    {timeAgo(v.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 font-ui text-xs text-present/40">
                  {v.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
