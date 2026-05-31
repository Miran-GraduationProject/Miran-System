const P    = '#2d8a56';
const P_LT = '#ecfdf5';

export default function FilterTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
              background: isActive ? '#fff' : 'transparent',
              color:      isActive ? '#111827' : '#6b7280',
              boxShadow:  isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
            <span style={{
              background: isActive ? P_LT : '#e5e7eb',
              color:      isActive ? P    : '#6b7280',
              borderRadius: '20px', padding: '1px 8px', fontSize: '12px', fontWeight: 700,
            }}>
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
