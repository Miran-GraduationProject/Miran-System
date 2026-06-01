import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const STYLES = {
  error:   { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c', Icon: AlertTriangle, bold: false },
  success: { bg: '#ecfdf5', border: '#d1fae5', color: '#2d8a56', Icon: CheckCircle,   bold: true  },
};

export default function AlertBox({ type = 'error', message, onClose }) {
  const s = STYLES[type] || STYLES.error;
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px',
      padding: '12px 18px', marginBottom: '20px',
      color: s.color, fontWeight: s.bold ? 600 : 400,
      display: 'flex', alignItems: 'center', justifyContent: onClose ? 'space-between' : 'flex-start',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <s.Icon size={16} />
        {message}
      </span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.color, display: 'flex', alignItems: 'center' }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
