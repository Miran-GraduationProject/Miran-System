// الفرص التدريبية المؤكدة — TailAdmin RTL style
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdVerified, MdLocalHospital, MdPeople, MdPrint, MdCalendarToday } from 'react-icons/md';

const API_BASE = 'http://localhost:3000/api/coordinator/training-period';
const P      = '#2d8a56';
const P_LT   = '#ecfdf5';
const P_MD   = '#d1fae5';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-SA') : '—';

function StatCard({ label, value, color, bg, icon: Icon }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#111827' }}>{value}</p>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{label}</p>
      </div>
    </div>
  );
}

function ConfirmedAllocationsPage() {
  const [periods, setPeriods]   = useState([]);
  const [pid, setPid]           = useState('');
  const [data, setData]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [dataLoad, setDataLoad]   = useState(false);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [error, setError]         = useState('');

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPeriods(); }, []);
  useEffect(() => { if (pid) fetchData(pid); }, [pid]);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/allocated-periods`, { headers });
      const ps = res.data.periods || [];
      setPeriods(ps);
      if (ps.length > 0) setPid(String(ps[0].periodID));
    } catch { setError('تعذر تحميل الفترات المعتمدة'); }
    finally { setLoading(false); }
  };

  const fetchData = async (id) => {
    setDataLoad(true);
    try {
      const confRes = await axios.get(`${API_BASE}/${id}/confirmed-allocations`, { headers });
      setData(confRes.data);

      // نحسب غير المعيّنين من registration-stats (عدد الطلاب الكلي - عدد المعيّنين المؤكدين)
      try {
        const statsRes = await axios.get(`http://localhost:3000/api/coordinator/training-period/registration-stats?periodID=${id}`, { headers });
        const totalRegistered = (statsRes.data.hospitals || []).reduce((sum, h) => sum + (h.maleRegistered || 0) + (h.femaleRegistered || 0), 0);
        const totalConfirmed  = confRes.data?.hospitals?.reduce((sum, h) => sum + (h.students?.length || 0), 0) || 0;
        setUnassignedCount(Math.max(0, totalRegistered - totalConfirmed));
      } catch { setUnassignedCount(0); }

    } catch { setError('تعذر تحميل بيانات التوزيع'); setData(null); }
    finally { setDataLoad(false); }
  };

  const totalStudents = data?.hospitals?.reduce((s, h) => s + (h.students?.length || 0), 0) || 0;
  const maleCount     = data?.hospitals?.reduce((s, h) => s + (h.students?.filter(st => st.gender === 'Male').length || 0), 0) || 0;
  const femaleCount   = data?.hospitals?.reduce((s, h) => s + (h.students?.filter(st => st.gender === 'Female').length || 0), 0) || 0;

  return (
    <div dir="rtl" style={{ padding: '32px', minHeight: '100vh', background: P_LT }}>

      {/* Header */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
        padding: '24px 28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: P_LT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MdVerified size={22} color={P} />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>التوزيعات المعتمدة</h1>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6b7280' }}>قوائم الطلاب المعتمدة رسمياً لكل فترة تدريب</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {loading ? (
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>جاري التحميل...</span>
          ) : periods.length === 0 ? (
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>لا توجد فترات معتمدة</span>
          ) : (
            <select value={pid} onChange={e => { setPid(e.target.value); setError(''); }} style={{
              padding: '9px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
              fontSize: '14px', fontFamily: 'inherit', background: '#fff', color: '#111827', direction: 'rtl',
            }}>
              {periods.map(p => <option key={p.periodID} value={p.periodID}>{p.name}</option>)}
            </select>
          )}
          <button onClick={() => window.print()} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: P_LT, color: P,
            border: `1px solid ${P_MD}`, borderRadius: '10px', padding: '9px 16px',
            cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
          }}>
            <MdPrint size={18} /> طباعة
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', color: '#b91c1c' }}>
          ⚠️ {error}
        </div>
      )}

      {dataLoad && <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>جاري تحميل البيانات...</div>}

      {!dataLoad && data && (
        <>
          {/* Period Info Card */}
          <div style={{
            background: P, borderRadius: '16px', padding: '24px 28px', marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(45,138,86,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MdCalendarToday size={20} color="rgba(255,255,255,0.9)" />
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{data.period?.name}</h2>
              </div>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '20px', padding: '5px 14px', fontSize: '13px', fontWeight: 600 }}>
                معتمد ✓
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'بداية التدريب',  value: fmtDate(data.period?.startDate) },
                { label: 'نهاية التدريب',   value: fmtDate(data.period?.endDate)   },
                { label: 'المستوى',          value: data.period?.level || '—'        },
                { label: 'المستشفيات',       value: data.hospitals?.length || 0      },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px 16px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <StatCard label="إجمالي الطلاب" value={totalStudents}               color="#6366f1" bg="#eef2ff"  icon={MdPeople}        />
            <StatCard label="الذكور"          value={maleCount}                   color="#3b82f6" bg="#eff6ff"  icon={MdPeople}        />
            <StatCard label="الإناث"          value={femaleCount}                 color="#8b5cf6" bg="#f5f3ff"  icon={MdPeople}        />
            <StatCard label="المستشفيات"      value={data.hospitals?.length || 0} color={P}       bg={P_LT}    icon={MdLocalHospital} />
            <StatCard label="غير معيّنين"     value={unassignedCount}             color="#dc2626" bg="#fef2f2"  icon={MdPeople}        />
          </div>

          {/* Hospital Sections */}
          {(data.hospitals?.length === 0) ? (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
              لا توجد بيانات
            </div>
          ) : data.hospitals?.map(h => {
            const males   = (h.students || []).filter(s => s.gender === 'Male');
            const females = (h.students || []).filter(s => s.gender === 'Female');
            return (
              <div key={h.opportunityID} style={{
                background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '20px',
              }}>
                {/* Hospital Header */}
                <div style={{ padding: '16px 24px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: P_LT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MdLocalHospital size={18} color={P} />
                    </span>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>{h.hospitalName}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>
                      ذكور: {h.maleCapacity || 0}
                    </span>
                    <span style={{ background: '#f5f3ff', color: '#8b5cf6', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>
                      إناث: {h.femaleCapacity || 0}
                    </span>
                    <span style={{ background: P_LT, color: P, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>
                      المسجّلون: {h.students?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Two-column tables */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', direction: 'rtl' }}>
                  {/* Males Table */}
                  <div style={{ borderLeft: '1px solid #f3f4f6' }}>
                    <div style={{ padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>الطلاب (ذكور) — {males.length}</span>
                    </div>
                    {males.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>لا يوجد طلاب ذكور</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f9fafb' }}>
                            {['#', 'الاسم', 'الرقم الجامعي', 'المعدل'].map(col => (
                              <th key={col} style={{ padding: '10px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {males.map((s, i) => (
                            <tr key={s.studentID}
                              style={{ borderBottom: '1px solid #f3f4f6' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{i + 1}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{s.firstName} {s.lastName}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{s.studentID}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{Number(s.universityGPA || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Females Table */}
                  <div>
                    <div style={{ padding: '12px 20px', background: '#f5f3ff', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#8b5cf6' }}>الطالبات (إناث) — {females.length}</span>
                    </div>
                    {females.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>لا توجد طالبات إناث</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f9fafb' }}>
                            {['#', 'الاسم', 'الرقم الجامعي', 'المعدل'].map(col => (
                              <th key={col} style={{ padding: '10px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {females.map((s, i) => (
                            <tr key={s.studentID}
                              style={{ borderBottom: '1px solid #f3f4f6' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{i + 1}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{s.firstName} {s.lastName}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{s.studentID}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{Number(s.universityGPA || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {!dataLoad && !data && pid && !error && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
          لا توجد توزيعات معتمدة لهذه الفترة
        </div>
      )}
    </div>
  );
}

export default ConfirmedAllocationsPage;
