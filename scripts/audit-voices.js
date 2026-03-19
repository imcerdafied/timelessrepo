#!/usr/bin/env node
/**
 * Voice Audit Script — checks all 270 characters and their inferred voice assignments.
 * Flags potential mismatches (e.g., female character getting male voice).
 *
 * Usage: node scripts/audit-voices.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load locations
const locPath = path.join(__dirname, '..', 'apps', 'frontend', 'src', 'data', 'locations.json')
const locations = JSON.parse(fs.readFileSync(locPath, 'utf-8')).locations

// Load characters (dynamic import since it's ESM with export)
const charPath = path.join(__dirname, '..', 'apps', 'frontend', 'src', 'data', 'era-characters.js')
const charContent = fs.readFileSync(charPath, 'utf-8')

// Extract ERA_CHARACTERS entries with regex (since we can't easily import JSX modules)
const charEntries = []
const charRegex = /"([^"]+)":\s*\{[\s\S]*?name:\s*"([^"]*)"[\s\S]*?role:\s*"([^"]*)"[\s\S]*?accent:\s*"([^"]*)"[\s\S]*?opening_line:\s*"([^"]*?)"/g
let match
while ((match = charRegex.exec(charContent)) !== null) {
  charEntries.push({
    eraKey: match[1],
    name: match[2],
    role: match[3],
    accent: match[4],
    openingLine: match[5].slice(0, 80),
  })
}

// Voice selection logic (mirrors backend)
const VOICES = {
  youngAmericanMale:   'Antoni',
  youngAmericanMale2:  'Josh',
  midAmericanMale:     'Adam',
  midAmericanMale2:    'Brian',
  oldAmericanMale:     'Jessie',
  youngAmericanFemale: 'Rachel',
  youngAmericanFemale3:'Matilda',
  youngAmericanFemale4:'Domi',
  midAmericanFemale:   'Serena',
  southernFemale:      'Grace',
  britishMale:         'Daniel',
  britishMale2:        'George',
  youngBritishMale:    'Dave',
  britishFemale:       'Dorothy',
  britishFemale2:      'Alice',
  irishMale:           'Fin',
  italianMale:         'Giovanni',
  childFemale:         'Gigi',
}

function inferGender(name, role, accent) {
  const combined = `${name} ${role} ${accent}`.toLowerCase()
  const femaleSignals = ['woman', 'female', 'girl', 'she ', 'her ', 'mother', 'wife', 'daughter',
    'sister', 'nun', 'mrs', 'miss', 'lady', 'queen', 'princess', 'nurse', 'midwife',
    'seamstress', 'washerwoman', 'laundress', 'singer', 'actress', 'maid', 'vera',
    'rosa', 'maria', 'elena', 'sofia', 'ana', 'liwayway', 'mary', 'jane', 'elizabeth', 'sarah']
  const maleSignals = ['man', 'male', 'boy', 'he ', 'his ', 'father', 'husband', 'son',
    'brother', 'monk', 'mr ', 'sir ', 'king', 'prince', 'soldier', 'captain', 'reporter',
    'photographer', 'priest', 'padre', 'rabbi', 'imam', 'dock worker', 'longshoreman',
    'firefighter', 'officer', 'jr', 'jr.', 'senior']
  const fScore = femaleSignals.filter(s => combined.includes(s)).length
  const mScore = maleSignals.filter(s => combined.includes(s)).length
  return fScore > mScore ? 'female' : mScore > fScore ? 'male' : 'male'
}

function inferAge(role, accent) {
  const combined = `${role} ${accent}`.toLowerCase()
  if (/\b(child|kid|boy |girl |teenage|teen |youth|young boy|young girl|student|12|13|14|15|16|17)\b/.test(combined)) return 'young'
  if (/\b(elderly|old |aged|retired|ancient|grandmother|grandfather|80|70|veteran)\b/.test(combined)) return 'old'
  if (/\b(young|20s|twenties|25|23|22)\b/.test(combined)) return 'young'
  return 'middle'
}

function inferAccent(accent, role) {
  const combined = `${accent} ${role}`.toLowerCase()
  if (/british|london|english|cockney|east end/i.test(combined)) return 'british'
  if (/irish/i.test(combined)) return 'irish'
  if (/italian/i.test(combined)) return 'italian'
  if (/southern|dixie|georgia|texas/i.test(combined)) return 'southern'
  return 'american'
}

function selectVoice(gender, age, accent) {
  if (gender === 'female') {
    if (accent === 'british') return age === 'young' ? 'Dorothy' : 'Alice'
    if (accent === 'southern') return 'Grace'
    if (age === 'young') return 'Matilda'
    if (age === 'old') return 'Serena'
    return 'Domi'
  }
  if (accent === 'british') {
    if (age === 'young') return 'Dave'
    if (age === 'old') return 'George'
    return 'Daniel'
  }
  if (accent === 'irish') return 'Fin'
  if (accent === 'italian') return 'Giovanni'
  if (age === 'young') return 'Antoni'
  if (age === 'old') return 'Jessie'
  return 'Adam'
}

// Run audit
console.log('\n=== VOICE AUDIT: All Characters ===\n')
console.log(`Found ${charEntries.length} characters\n`)

const issues = []
const stats = { male: 0, female: 0, young: 0, middle: 0, old: 0 }

for (const char of charEntries) {
  const gender = inferGender(char.name, char.role, char.accent)
  const age = inferAge(char.role, char.accent)
  const accent = inferAccent(char.accent, char.role)
  const voice = selectVoice(gender, age, accent)

  stats[gender]++
  stats[age]++

  // Flag potential issues
  const potentialIssues = []

  // Check: name suggests different gender than inferred
  const nameLower = char.name.toLowerCase()
  const commonFemNames = ['maria', 'rosa', 'vera', 'elena', 'sofia', 'ana', 'mary', 'jane', 'elizabeth',
    'sarah', 'liwayway', 'harriet', 'dorothy', 'alice', 'emily', 'charlotte', 'florence', 'bessie', 'ella']
  const commonMaleNames = ['james', 'john', 'thomas', 'william', 'robert', 'charles', 'george', 'henry',
    'samuel', 'david', 'joseph', 'michael', 'daniel', 'muhammad', 'jose', 'pedro', 'hans', 'pierre']
  if (commonFemNames.some(n => nameLower.includes(n)) && gender === 'male') {
    potentialIssues.push(`Name "${char.name}" suggests female but inferred male`)
  }
  if (commonMaleNames.some(n => nameLower.includes(n)) && gender === 'female') {
    potentialIssues.push(`Name "${char.name}" suggests male but inferred female`)
  }

  // Check: role mentions specific demographics that voice might not match
  const roleLower = char.role.toLowerCase()
  if (roleLower.includes('african') || roleLower.includes('black') || roleLower.includes('yoruba') ||
      roleLower.includes('enslaved') || roleLower.includes('harlem')) {
    potentialIssues.push(`Character is African/Black — default voices lack ethnic diversity`)
  }
  if (roleLower.includes('chinese') || roleLower.includes('japanese') || roleLower.includes('korean')) {
    potentialIssues.push(`Character is East Asian — default voices lack ethnic diversity`)
  }
  if (roleLower.includes('indigenous') || roleLower.includes('ohlone') || roleLower.includes('native')) {
    potentialIssues.push(`Character is Indigenous — default voices lack ethnic diversity`)
  }
  if (roleLower.includes('mexican') || roleLower.includes('latino') || roleLower.includes('chicano')) {
    potentialIssues.push(`Character is Latino — default voices lack ethnic diversity`)
  }

  const status = potentialIssues.length > 0 ? '⚠️' : '✅'
  console.log(`${status} [${char.eraKey}] ${char.name}`)
  console.log(`   Role: ${char.role}`)
  console.log(`   Inferred: ${gender} / ${age} / ${accent} → Voice: ${voice}`)
  if (potentialIssues.length > 0) {
    potentialIssues.forEach(issue => {
      console.log(`   ⚠️  ${issue}`)
      issues.push({ eraKey: char.eraKey, name: char.name, issue })
    })
  }
  console.log()
}

console.log('\n=== SUMMARY ===')
console.log(`Total characters: ${charEntries.length}`)
console.log(`Gender split: ${stats.male} male, ${stats.female} female`)
console.log(`Age split: ${stats.young} young, ${stats.middle} middle-aged, ${stats.old} old`)
console.log(`\nIssues found: ${issues.length}`)
if (issues.length > 0) {
  console.log('\n--- Issues requiring attention ---')
  issues.forEach(i => console.log(`  [${i.eraKey}] ${i.name}: ${i.issue}`))
}
console.log('\nNote: ElevenLabs default voices lack ethnic diversity.')
console.log('For African American, Asian, Indigenous, and Latino characters,')
console.log('consider using ElevenLabs Voice Design API or community voices.')
