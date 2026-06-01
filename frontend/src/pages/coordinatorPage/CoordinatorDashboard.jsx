// صفحة المنسق الرئيسة — TailAdmin RTL style
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdLocalHospital,
  MdDateRange,
  MdVerified,
  MdBarChart,
  MdPeople,
  MdDashboard,
} from 'react-icons/md';
import PageHeader from '../../components/common/PageHeader';
import StatCard   from '../../components/common/StatCard';

const PRIMARY    = '#2d8a56';
const PRIMARY_LT = '#ecfdf5';
const PRIMARY_MD = '#d1fae5';

function QuickActionBtn({ label, icon: Icon, onClick, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#f0fdf4' : '#ffffff',
        border: `1px solid ${hovered ? PRIMARY_MD : '#e5e7eb'}`,
        borderRadius: '14px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        textAlign: 'right',
        direction: 'rtl',
        transition: 'all 0.2s',
        boxShadow: hovered ? '0 4px 14px rgba(45,138,86,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        width: '100%',
      }}
    >
      <span
        style={{
          width: '40px', height: '40px', flexShrink: 0,
          borderRadius: '10px',
          background: hovered ? PRIMARY : PRIMARY_LT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        <Icon size={20} color={hovered ? '#fff' : PRIMARY} />
      </span>
      <div style={{ textAlign: 'right' }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#111827' }}>{label}</p>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280' }}>{desc}</p>
      </div>
    </button>
  );
}

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ openPeriods: 0, allocatedPeriods: 0, hospitals: 0 });
  const [loading, setLoading] = useState(true);

  const firstName = localStorage.getItem('firstName') || 'المنسق';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/coordinator/training-period/all-periods',      { headers }).then(r => r.json()),
      fetch('/api/coordinator/training-period/allocated-periods', { headers }).then(r => r.json()),
      fetch('/api/coordinator/hospitals',                         { headers }).then(r => r.json()),
    ]).then(([periodsData, allocatedData, hospitalsData]) => {
      setStats({
        openPeriods:      periodsData.periods?.length ?? 0,
        allocatedPeriods: allocatedData.periods?.length ?? 0,
        hospitals:        Array.isArray(hospitalsData) ? hospitalsData.length : 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { label: 'إدارة المستشفيات',   desc: 'إضافة وتعديل وحذف المستشفيات',   icon: MdLocalHospital, path: '/hospitals'            },
    { label: 'الفترات التدريبية',  desc: 'إنشاء ومتابعة فترات التدريب',     icon: MdDateRange,     path: '/training-periods'     },
    { label: 'متابعة التسجيل',     desc: 'إحصائيات التسجيل لكل فترة',        icon: MdBarChart,      path: '/registration-monitor' },
    { label: 'قوائم الطلاب',       desc: 'توليد واعتماد التوزيع التلقائي',   icon: MdPeople,        path: '/student-list'         },
    { label: 'الفرص المؤكدة',      desc: 'عرض التوزيعات المعتمدة نهائياً',  icon: MdVerified,      path: '/confirmed-allocations'},
  ];

  return (
    <div dir="rtl" style={{ padding: '32px', minHeight: '100vh', background: PRIMARY_LT }}>

      <PageHeader icon={MdDashboard} title="لوحة التحكم الرئيسية" subtitle={`مرحباً ${firstName}، إدارة شؤون التدريب التعاوني لجامعة أم القرى`}>
        <span style={{
          background: PRIMARY_LT, border: `1px solid ${PRIMARY_MD}`,
          borderRadius: '20px', padding: '6px 16px',
          fontSize: '13px', color: PRIMARY, fontWeight: 600,
        }}>
          منسق جامعي
        </span>
      </PageHeader>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <StatCard icon={MdLocalHospital} label="المستشفيات المتاحة"  value={loading ? '—' : stats.hospitals}        sub="إجمالي المستشفيات" />
        <StatCard icon={MdDateRange}     label="الفترات التدريبية"   value={loading ? '—' : stats.openPeriods}      sub="كل الفترات"        />
        <StatCard icon={MdVerified}      label="فرص تدريب مؤكدة"    value={loading ? '—' : stats.allocatedPeriods} sub="تم الاعتماد"       accent />
      </div>

      {/* Quick Actions */}
      <div style={{
        background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb',
        padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>الإجراءات السريعة</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>وصول سريع لأهم صفحات النظام</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {quickActions.map((a) => (
            <QuickActionBtn key={a.path} label={a.label} desc={a.desc} icon={a.icon} onClick={() => navigate(a.path)} />
          ))}
        </div>
      </div>
    </div>
  );
}
