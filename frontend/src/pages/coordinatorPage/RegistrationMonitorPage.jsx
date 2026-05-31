// متابعة حالة التسجيل — TailAdmin RTL style
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdBarChart, MdRefresh, MdLocalHospital, MdPeople, MdWarning } from 'react-icons/md';

const API_BASE = 'http://localhost:3000/api/coordinator';
const P        = '#2d8a56';
const P_LT     = '#ecfdf5';
const P_MD     = '#d1fae5';

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

function ProgressBar({ value, color }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, background: color, height: '100%', borderRadius: '99px', transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function RegistrationMonitorPage() {
  const [periods, setPeriods]               = useState([]);
  const [selectedPeriodID, setSelectedPeriodID] = useState('');
  const [stats, setStats]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [statsLoading, setStatsLoading]     = useState(false);
  const [error, setError]                   = useState('');

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPeriods(); }, []);
  useEffect(() => { if (selectedPeriodID) fetchStats(selectedPeriodID); else setStats(null); }, [selectedPeriodID]);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/training-period/all-periods`, { headers });
      const ps = res.data.periods || [];
      setPeriods(ps);
      const open = ps.find(p => p.status === 'OPEN') || ps[0];
      if (open) setSelectedPeriodID(String(open.periodID));
    } catch { setError('تعذر تحميل الفترات'); }
    finally { setLoading(false); }
  };

  const fetchStats = async (pid) => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${API_BASE}/training-period/registration-stats?periodID=${pid}`, { headers });
      setStats(res.data);
    } catch { setError('تعذر تحميل الإحصائيات'); setStats(null); }
    finally { setStatsLoading(false); }
  };


  return (
    <div dir="rtl" style={{ padding: '32px', minHeight: '100vh', background: P_LT }}>

      {/* Header */}
      <div style={{
        background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb',
        padding:'24px 28px', marginBottom:'24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ width:44, height:44, borderRadius:12, background:P_LT, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <MdBarChart size={22} color={P} />
          </span>
          <div>
            <h1 style={{ margin:0, fontSize:'20px', fontWeight:700, color:'#111827' }}>متابعة حالة التسجيل</h1>
            <p style={{ margin:'3px 0 0', fontSize:'13px', color:'#6b7280' }}>إحصائيات التسجيل لكل فترة تدريبية</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {loading ? (
            <span style={{ fontSize:'13px', color:'#9ca3af' }}>جاري التحميل...</span>
          ) : (
            <select value={selectedPeriodID} onChange={e => { setSelectedPeriodID(e.target.value); setError(''); }} style={{
              padding:'9px 14px', borderRadius:'10px', border:'1px solid #e5e7eb',
              fontSize:'14px', fontFamily:'inherit', background:'#fff', color:'#111827', direction:'rtl',
            }}>
              <option value="">اختر فترة...</option>
              {periods.map(p => <option key={p.periodID} value={p.periodID}>{p.name}</option>)}
            </select>
          )}
          <button onClick={() => selectedPeriodID && fetchStats(selectedPeriodID)} style={{
            display:'flex', alignItems:'center', gap:'6px', background:P_LT, color:P,
            border:`1px solid ${P_MD}`, borderRadius:'10px', padding:'9px 16px',
            cursor:'pointer', fontWeight:600, fontSize:'14px', fontFamily:'inherit',
          }}>
            <MdRefresh size={18}/> تحديث
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'12px 18px', marginBottom:'20px', color:'#b91c1c' }}>
          <MdWarning size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} /> {error}
        </div>
      )}

      {statsLoading && <div style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>جاري تحميل الإحصائيات...</div>}

      {!statsLoading && stats && (
        <>
          {/* Summary Card — إجمالي فقط */}
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', padding:'24px 28px', marginBottom:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <span style={{ fontSize:'14px', fontWeight:600, color:'#374151' }}>إجمالي الطلاب المُسجَّلين</span>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'14px', color:'#374151' }}>{stats.totalRegistered||0} من {stats.totalStudents||0}</span>
                <span style={{ fontSize:'14px', fontWeight:700, color:P }}>{pct(stats.totalRegistered||0, stats.totalStudents||0)}%</span>
              </div>
            </div>
            <ProgressBar value={pct(stats.totalRegistered||0, stats.totalStudents||0)} color={P} />
          </div>

          {/* Gender Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
            {[
              { label:'طلاب ذكور',    sub:'سجّلوا رغباتهم',  reg: stats.totalMaleRegistered   || 0, total: stats.totalMaleStudents   || 0, color: P,         bg: P_LT,    barColor:'#3b82f6', Icon: MdPeople, iconColor:'#3b82f6' },
              { label:'طالبات إناث', sub:'سجّلن رغباتهن',   reg: stats.totalFemaleRegistered || 0, total: stats.totalFemaleStudents || 0, color: P,         bg: P_LT,    barColor:'#a855f7', Icon: MdPeople, iconColor:'#a855f7' },
            ].map(c => (
              <div key={c.label} style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'4px' }}>
                  <c.Icon size={24} color={c.iconColor} />
                </div>
                <p style={{ margin:0, fontSize:'14px', fontWeight:600, color:'#374151' }}>{c.label}</p>
                <p style={{ margin:0, fontSize:'32px', fontWeight:800, color:c.color }}>{c.reg}</p>
                <p style={{ margin:0, fontSize:'12px', color:'#9ca3af' }}>{c.sub}</p>
                <div style={{ width:'100%', marginTop:'4px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6b7280', marginBottom:'6px' }}>
                    <span>{c.reg} من {c.total}</span>
                    <span style={{ fontWeight:700, color:c.color }}>{pct(c.reg, c.total)}%</span>
                  </div>
                  <ProgressBar value={pct(c.reg, c.total)} color={c.barColor} />
                </div>
              </div>
            ))}
          </div>

          {/* Hospital Cards */}
          {stats.hospitals && stats.hospitals.length > 0 ? (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <MdLocalHospital size={18} color={P} />
                <h2 style={{ margin:0, fontSize:'15px', fontWeight:700, color:'#111827' }}>المستشفيات</h2>
                <span style={{ background:P_LT, color:P, borderRadius:'20px', padding:'3px 10px', fontSize:'12px', fontWeight:600 }}>
                  {stats.hospitals.length} مستشفى
                </span>
              </div>
              <p style={{ margin:'0 0 16px', fontSize:'12px', color:'#9ca3af' }}>
                الأرقام تعكس عدد الطلاب الذين أدرجوا كل مستشفى في قائمة تفضيلاتهم بأي مرتبة
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px' }}>
                {stats.hospitals.map(h => {
                  const mPct = pct(h.maleRegistered||0, h.maleCapacity||0);
                  const fPct = pct(h.femaleRegistered||0, h.femaleCapacity||0);
                  const totalCap = (h.maleCapacity||0) + (h.femaleCapacity||0);
                  const totalReg = (h.maleRegistered||0) + (h.femaleRegistered||0);
                  const tPct    = pct(totalReg, totalCap);
                  const mFull   = mPct >= 100;
                  const fFull   = fPct >= 100;
                  const bothFull = mFull && fFull;
                  const isFull  = bothFull;
                  const isNear  = tPct >= 80 && !bothFull;

                  let badgeText, badgeBg, badgeColor, headerBg;
                  if (bothFull) {
                    badgeText = 'اكتملت'; badgeBg = 'rgba(255,255,255,0.2)'; badgeColor = '#fff'; headerBg = P;
                  } else if (mFull && !fFull) {
                    badgeText = 'الذكور اكتملوا'; badgeBg = '#eff6ff'; badgeColor = '#1d4ed8'; headerBg = '#f9fafb';
                  } else if (fFull && !mFull) {
                    badgeText = 'الإناث اكتملن'; badgeBg = '#f5f3ff'; badgeColor = '#6d28d9'; headerBg = '#f9fafb';
                  } else if (isNear) {
                    badgeText = 'شارفت'; badgeBg = '#fffbeb'; badgeColor = '#d97706'; headerBg = '#f9fafb';
                  } else {
                    badgeText = 'متاح'; badgeBg = P_LT; badgeColor = P; headerBg = '#f9fafb';
                  }

                  return (
                    <div key={h.opportunityID} style={{
                      background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb',
                      boxShadow:'0 1px 4px rgba(0,0,0,0.04)', overflow:'hidden',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 14px rgba(45,138,86,0.1)'}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}>
                      <div style={{ padding:'16px 20px', background:headerBg, borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <span style={{ width:36, height:36, borderRadius:10, background:isFull?'rgba(255,255,255,0.2)':P_LT, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <MdLocalHospital size={18} color={isFull?'#fff':P} />
                          </span>
                          <div>
                            <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:isFull?'#fff':'#111827' }}>{h.hospitalName}</p>
                            <p style={{ margin:0, fontSize:'12px', color:isFull?'rgba(255,255,255,0.8)':'#6b7280' }}>{totalReg} / {totalCap} مقعد</p>
                          </div>
                        </div>
                        <span style={{
                          background:badgeBg, color:badgeColor,
                          borderRadius:'20px', padding:'4px 12px', fontSize:'12px', fontWeight:600,
                        }}>
                          {badgeText}
                        </span>
                      </div>
                      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:'14px' }}>
                        {[
                          { label:'الراغبون (ذكور)',   reg:h.maleRegistered||0,   cap:h.maleCapacity||0,   p:mPct, color:'#3b82f6' },
                          { label:'الراغبات (إناث)', reg:h.femaleRegistered||0, cap:h.femaleCapacity||0, p:fPct, color:'#8b5cf6' },
                        ].map(row => (
                          <div key={row.label}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                              <span style={{ fontSize:'13px', color:'#374151' }}>{row.label}</span>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <span style={{ fontSize:'13px', color:'#6b7280' }}>{row.reg} / {row.cap}</span>
                                {row.p > 100 ? (
                                  <span style={{ fontSize:'11px', fontWeight:700, background:'#fef3c7', color:'#b45309', borderRadius:'20px', padding:'2px 8px' }}>
                                    طلب عالٍ {row.p}%
                                  </span>
                                ) : (
                                  <span style={{ fontSize:'13px', fontWeight:700, color:row.color }}>{row.p}%</span>
                                )}
                              </div>
                            </div>
                            <ProgressBar value={row.p} color={row.color} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', padding:'48px', textAlign:'center', color:'#9ca3af' }}>
              لا توجد بيانات مستشفيات لهذه الفترة
            </div>
          )}
        </>
      )}

      {!statsLoading && !stats && selectedPeriodID && !error && (
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', padding:'48px', textAlign:'center', color:'#9ca3af' }}>
          لا توجد إحصائيات لهذه الفترة
        </div>
      )}
    </div>
  );
}
