import { useState } from 'react';

const P    = '#2d8a56';
const P_LT = '#ecfdf5';

export default function StatCard({ icon: Icon, label, value, color, bg, sub, accent }) {
  const [hovered, setHovered] = useState(false);

  const cardBg     = accent ? P : '#fff';
  const textColor  = accent ? '#fff' : '#111827';
  const labelColor = accent ? 'rgba(255,255,255,0.8)' : '#6b7280';
  const subColor   = accent ? 'rgba(255,255,255,0.7)' : '#9ca3af';
  const iconBg     = accent ? 'rgba(255,255,255,0.2)' : (bg || P_LT);
  const iconColor  = accent ? '#fff' : (color || P);

  return (
    <div
      style={{
        background: cardBg,
        borderRadius: '16px',
        border: `1px solid ${accent ? 'transparent' : '#e5e7eb'}`,
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        boxShadow: hovered ? '0 6px 20px rgba(45,138,86,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        direction: 'rtl',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          width: 48, height: 48, borderRadius: 12, background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={iconColor} />
        </span>
        {sub && <span style={{ fontSize: '12px', color: subColor, fontWeight: 500 }}>{sub}</span>}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '13px', color: labelColor, marginBottom: '6px' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: textColor, lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}
