const VenueCard = ({ venue, onEnter }) => (
  <div
    onClick={() => onEnter(venue)}
    style={{
      backgroundColor: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
      <span style={{ fontSize: '24px' }}>{venue.icon}</span>
      <div>
        <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>
          {venue.name}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.45)', fontSize: '12px',
          letterSpacing: '0.06em', textTransform: 'uppercase'
        }}>
          {venue.type} · {venue.duration_hint}
        </div>
      </div>
    </div>
    <div style={{
      color: 'rgba(255,255,255,0.6)', fontSize: '14px',
      lineHeight: 1.5, marginBottom: '8px'
    }}>
      {venue.description}
    </div>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      color: '#f59e0b', fontSize: '13px', fontWeight: 500
    }}>
      Enter &rarr;
    </div>
  </div>
)

export default VenueCard
