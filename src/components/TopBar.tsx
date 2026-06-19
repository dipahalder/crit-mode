// The 53px app top bar from Atelier.dc.html: logo + product name on the left,
// and (workspace only) a "Critiquing <brand>" pill plus a "Switch brand" button
// that returns to the start screen.

export default function TopBar({
  isWorkspace,
  brandLabel,
  onStartOver,
}: {
  isWorkspace: boolean
  brandLabel: string
  onStartOver: () => void
}) {
  return (
    <div style={{ height: 53, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', background: '#ffffff', borderBottom: '1px solid #ececf0', zIndex: 30 }}>
      <button
        type="button"
        onClick={isWorkspace ? onStartOver : undefined}
        aria-label="Design Crit Mode home"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          background: 'none',
          border: 'none',
          padding: 0,
          fontFamily: 'inherit',
          color: 'inherit',
          cursor: isWorkspace ? 'pointer' : 'default',
        }}
      >
        <div style={{ width: 25, height: 25, borderRadius: 7, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(79,70,229,.35)' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', border: '2.5px solid #fff' }} />
        </div>
        <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.3px' }}>Design Crit Mode</span>
      </button>
      {isWorkspace && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#71717a' }}>Critiquing</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#3f3f46', background: '#f4f4f6', border: '1px solid #ececf0', borderRadius: 999, padding: '5px 12px' }}>{brandLabel}</span>
          <button
            type="button"
            onClick={onStartOver}
            style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: '#52525b', background: '#fff', border: '1px solid #e4e4e9', borderRadius: 8, padding: '7px 13px', cursor: 'pointer' }}
          >
            Switch brand
          </button>
        </div>
      )}
    </div>
  )
}
