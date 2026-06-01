const P    = '#2d8a56';
const P_LT = '#ecfdf5';

export default function PageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
      padding: '20px 24px', marginBottom: '24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{
          width: 44, height: 44, borderRadius: 12, background: P_LT,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={22} color={P} />
        </span>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>{title}</h1>
          {subtitle && <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6b7280' }}>{subtitle}</p>}
        </div>
      </div>
      {children && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
