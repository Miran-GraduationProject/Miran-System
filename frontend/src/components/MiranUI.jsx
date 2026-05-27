/* MiranUI.jsx — Shared design-system components for coordinator pages */

/* ── API helpers ── */
export const authH = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});
export const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { ...authH(), ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `خطأ ${res.status}`);
  }
  return res.json();
};

/* ── Date helpers ── */
const AR_M = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
export const fmtDate  = d => { if (!d) return '—'; const t = new Date(d); return isNaN(t) ? '—' : `${t.getDate()} ${AR_M[t.getMonth()]} ${t.getFullYear()}`; };
export const fmtShort = d => { if (!d) return '—'; const t = new Date(d); return isNaN(t) ? '—' : `${t.getDate()} ${AR_M[t.getMonth()]}`; };
export const initials = (n = '') => { const p = n.trim().split(/\s+/); return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] || '' : '')).toUpperCase(); };
const AV_CLS = ['av-green','av-blue','av-purple','av-amber','av-rose','av-teal'];
export const avCls = n => AV_CLS[(n?.charCodeAt(0) || 0) % AV_CLS.length];

/* ── Badge ── */
export function Badge({ tone = 'neutral', dot = false, children }) {
  const s = {
    success: 'bg-success-50 text-success-600',
    error:   'bg-error-50 text-error-600',
    danger:  'bg-error-50 text-error-600',
    warning: 'bg-warning-50 text-warning-600',
    neutral: 'bg-gray-100 text-gray-600',
    purple:  'bg-purple-50 text-purple-700',
    brand:   'bg-brand-25 text-brand-700',
    bright:  'bg-brand-800 text-white',
  }[tone] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />}
      {children}
    </span>
  );
}

/* ── Button ── */
export function Btn({ variant = 'primary', size = 'md', icon, onClick, children, disabled, className = '', type = 'button' }) {
  const sz = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5',
    sm: 'px-3.5 py-2 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
  }[size] || 'px-4 py-2.5 text-sm gap-2';

  const v = {
    primary:       'bg-brand-800 text-white hover:bg-brand-900 shadow-theme-xs',
    secondary:     'bg-brand-25 text-brand-800 hover:bg-brand-50',
    outline:       'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-theme-xs',
    ghost:         'text-gray-600 hover:bg-gray-100',
    danger:        'bg-error-600 text-white hover:bg-error-700 shadow-theme-xs',
    'danger-ghost':'text-error-600 hover:bg-error-50',
  }[variant] || 'bg-brand-800 text-white hover:bg-brand-900 shadow-theme-xs';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', whiteSpace:'nowrap', flexShrink:0 }}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${sz} ${v} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

/* ── Modal ── */
import { useEffect } from 'react';
export function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        onClick={e => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-theme-lg animate-modal-in ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Form Field ── */
export function Field({ label, required, hint, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}{required && <span className="text-brand-600 ms-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-theme-xs transition focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/10 placeholder:text-gray-400';
export function TextInput({ className = '', ...p }) { return <input className={`${inputCls} ${className}`} {...p} />; }
export function MSelect({ children, className = '', ...p }) { return <select className={`${inputCls} cursor-pointer ${className}`} {...p}>{children}</select>; }
export function TextArea({ className = '', ...p }) { return <textarea className={`${inputCls} resize-none ${className}`} {...p} />; }

/* ── Tabs ── */
export function Tabs({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-gray-50 p-1">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            value === o.value ? 'bg-white text-gray-800 shadow-theme-xs' : 'text-gray-500 hover:text-gray-700'
          }`}>
          {o.label}
          {o.count != null && (
            <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${
              value === o.value ? 'bg-brand-25 text-brand-700' : 'bg-gray-200 text-gray-500'
            }`}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Search Input ── */
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M3.04 9.37a6.33 6.33 0 1 1 12.67 0 6.33 6.33 0 0 1-12.67 0ZM9.37 1.54a7.83 7.83 0 1 0 4.99 13.87l2.82 2.82a.75.75 0 0 0 1.06-1.06l-2.82-2.82A7.83 7.83 0 0 0 9.37 1.54Z" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'بحث...'}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white ps-9 pe-4 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/10 placeholder:text-gray-400"
      />
    </div>
  );
}

/* ── Page Header ── */
export function PageHeader({ title, sub, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-title-2xl font-bold text-gray-900">{title}</h1>
        {sub && <p className="mt-1 text-theme-sm text-gray-500">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

/* ── Metric Card ── */
export function MetricCard({ icon, label, value, sub, accent = false }) {
  if (accent) {
    return (
      <div className="rounded-2xl p-5 md:p-6 shadow-theme-sm" style={{ background: 'linear-gradient(135deg, #10451d 0%, #208b3a 100%)' }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: 'rgba(255,255,255,0.15)' }}>{icon}</div>
        <div className="mt-5">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</span>
          <h4 className="mt-2 text-lg font-bold text-white">{value}</h4>
          {sub && <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{sub}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs hover:shadow-theme-sm transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">{icon}</div>
      <div className="mt-5">
        <span className="text-sm text-gray-500">{label}</span>
        <h4 className="mt-2 text-lg font-bold text-gray-800">{value}</h4>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Table primitives ── */
export function DataTable({ children }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="data-table min-w-full">{children}</table>
    </div>
  );
}
export function TH({ children, end }) {
  return <th className={end ? 'text-end' : 'text-start'}><span>{children}</span></th>;
}
export function TD({ children, tabular, end, muted, fw }) {
  return (
    <td className={end ? 'text-end' : ''}>
      <span className={`text-sm ${muted ? 'text-gray-400' : fw ? 'font-semibold text-gray-800' : 'text-gray-600'} ${tabular ? 'tabular-nums' : ''}`}>
        {children}
      </span>
    </td>
  );
}
export function TR({ children, onClick }) {
  return <tr className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>{children}</tr>;
}

/* ── Empty State ── */
export function EmptyState({ emoji = '📋', title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">{emoji}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {sub && <p className="mt-2 text-sm text-gray-500 max-w-xs">{sub}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ── Alert ── */
export function Alert({ tone = 'danger', children, onDismiss }) {
  return <AlertMsg tone={tone} onDismiss={onDismiss}>{children}</AlertMsg>;
}
export function AlertMsg({ tone = 'danger', children, onDismiss }) {
  const s = {
    danger:  'bg-error-50 border-error-100 text-error-600',
    success: 'bg-success-50 border-success-100 text-success-600',
    warning: 'bg-warning-50 border-warning-100 text-warning-600',
  }[tone] || 'bg-error-50 border-error-100 text-error-600';
  return (
    <div className={`mb-4 flex items-start justify-between rounded-xl border px-4 py-3 text-sm font-medium ${s}`}>
      <span>{children}</span>
      {onDismiss && <button onClick={onDismiss} className="ms-3 opacity-60 hover:opacity-100 text-lg leading-none shrink-0">×</button>}
    </div>
  );
}

/* ── Skeleton ── */
export function Skeleton({ h = 100, r = 12 }) {
  return <div className="shimmer" style={{ height: h, borderRadius: r }} />;
}

/* ── Progress Bar ── */
export function ProgressBar({ value, max, h = 6, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill = color ?? (pct >= 100 ? '#d92d20' : pct >= 85 ? '#f79009' : '#25a244');
  return (
    <div className="w-full overflow-hidden rounded-full bg-gray-100" style={{ height: h }}>
      <div className="pb-fill h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
    </div>
  );
}
