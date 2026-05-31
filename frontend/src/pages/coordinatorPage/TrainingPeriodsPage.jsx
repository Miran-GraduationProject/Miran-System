// إدارة الفترات التدريبية — TailAdmin RTL style
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { MdDateRange, MdAdd, MdEdit, MdDelete, MdClose, MdSearch, MdRefresh, MdWarning } from 'react-icons/md';
import PageHeader  from '../../components/common/PageHeader';
import AlertBox    from '../../components/common/AlertBox';
import FilterTabs  from '../../components/common/FilterTabs';

const API  = 'http://localhost:3000/api/coordinator/training-period';
const P    = '#2d8a56';
const P_LT = '#ecfdf5';
const P_MD = '#d1fae5';

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', background: '#fafafa', direction: 'rtl', boxSizing: 'border-box',
};

const levels = [1,2,3,4,5,6,7,8,9,10];
const fmtDate = (d) => { const dt = new Date(d); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; };
const fmtLevel = (l) => l ? (l.toString().replace(/[^\d]/g, '') || l) : '—';
const toYMD = (dmy) => { const [d,m,y] = (dmy||'').split('/'); return (d&&m&&y&&y.length===4) ? `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` : ''; };
const toDMY = (ymd) => { if (!ymd) return ''; const [y,m,d] = ymd.split('-'); return `${d}/${m}/${y}`; };
const emptyDates = { startDate:'', endDate:'', registrationOpen:'', registrationClose:'' };
const emptyHospital = { hospitalID: '', maleCapacity: '', femaleCapacity: '' };

const errorMessages = {
  'All fields are required': 'جميع الحقول مطلوبة',
  'End date must be after start date': 'تاريخ النهاية يجب أن يكون بعد البداية',
  'Registration close date must be after open date': 'تاريخ إغلاق التسجيل يجب أن يكون بعد فتحه',
  'A training period for this level is already open': 'يوجد فترة مفتوحة لهذا المستوى بالفعل',
  'Duplicate hospitals are not allowed': 'لا يمكن إضافة نفس المستشفى مرتين',
  'Cannot delete period after registration has opened': 'لا يمكن حذف الفترة بعد بدء التسجيل',
};

const getRegStatus = (period) => {
  const now = new Date();
  if (period.status === 'ALLOCATED') return { label: 'تم التوزيع',         cls: P,       bg: P_LT };
  if (now < new Date(period.registrationOpen))  return { label: 'لم يبدأ التسجيل', cls: '#d97706', bg: '#fffbeb' };
  if (now <= new Date(period.registrationClose)) return { label: 'التسجيل مفتوح',  cls: P,       bg: P_LT };
  return { label: 'التسجيل مغلق', cls: '#6b7280', bg: '#f3f4f6' };
};

export default function TrainingPeriodsPage() {
  const [showForm, setShowForm]       = useState(false);
  const [editingID, setEditingID]     = useState(null);
  const [periods, setPeriods]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [submitError, setSubmitError] = useState('');
  const [hospitalsList, setHospitalsList] = useState([]);
  const [hospitals, setHospitals]     = useState([{ ...emptyHospital }]);
  const [formData, setFormData]       = useState({ name:'', level:'', startDate:'', endDate:'', registrationOpen:'', registrationClose:'' });
  const [dateDisp, setDateDisp]       = useState({ ...emptyDates });
  const [search, setSearch]           = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [periodHospitals, setPeriodHospitals] = useState([]);
  const [newHospital, setNewHospital]  = useState({ ...emptyHospital });

  const token       = localStorage.getItem('token');
  const decoded     = token ? jwtDecode(token) : null;
  const activatedBy = decoded?.id;
  const headers     = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPeriods(); fetchHospitalsList(); }, []);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/all-periods`, { headers });
      setPeriods(res.data.periods || []);
    } catch { setError('تعذر تحميل الفترات'); }
    finally { setLoading(false); }
  };

  const fetchHospitalsList = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/coordinator/hospitals', { headers });
      setHospitalsList(Array.isArray(res.data) ? res.data : []);
    } catch { console.error('fetchHospitalsList error'); }
  };

  const handleEdit = async (period) => {
    setEditingID(period.periodID);
    const sd = period.startDate?.slice(0,10), ed = period.endDate?.slice(0,10);
    const ro = period.registrationOpen?.slice(0,10), rc = period.registrationClose?.slice(0,10);
    setFormData({ name: period.name, level: fmtLevel(period.level), startDate: sd, endDate: ed, registrationOpen: ro, registrationClose: rc });
    setDateDisp({ startDate: toDMY(sd), endDate: toDMY(ed), registrationOpen: toDMY(ro), registrationClose: toDMY(rc) });
    setNewHospital({ ...emptyHospital });
    try {
      const res = await axios.get(`${API}/registration-stats?periodID=${period.periodID}`, { headers });
      setPeriodHospitals(res.data.hospitals || []);
    } catch { setPeriodHospitals([]); }
    setShowForm(true); setSubmitError('');
  };

  const handleAddHospital = async () => {
    if (!newHospital.hospitalID) return;
    try {
      await axios.post(`${API}/${editingID}/hospitals`, {
        hospitalID: newHospital.hospitalID,
        maleCapacity: Number(newHospital.maleCapacity) || 0,
        femaleCapacity: Number(newHospital.femaleCapacity) || 0,
      }, { headers });
      const res = await axios.get(`${API}/registration-stats?periodID=${editingID}`, { headers });
      setPeriodHospitals(res.data.hospitals || []);
      setNewHospital({ ...emptyHospital });
    } catch (err) { setSubmitError(err.response?.data?.message || 'تعذر إضافة المستشفى'); }
  };

  const handleRemoveHospital = async (hospitalID) => {
    setSubmitError('');
    try {
      await axios.delete(`${API}/${editingID}/hospitals/${hospitalID}`, { headers });
      const res = await axios.get(`${API}/registration-stats?periodID=${editingID}`, { headers });
      setPeriodHospitals(res.data.hospitals || []);
    } catch (err) { setSubmitError(err.response?.data?.message || 'تعذر حذف المستشفى'); }
  };

  const handleDelete = async (period) => {
    if (!window.confirm(`هل تريد حذف "${period.name}"؟`)) return;
    try {
      await axios.delete(`${API}/${period.periodID}`, { headers });
      setPeriods(periods.filter(p => p.periodID !== period.periodID));
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(errorMessages[msg] || msg || 'تعذر الحذف');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitError('');
    try {
      if (editingID) {
        const hospitalPayload = periodHospitals.map(h => ({
          hospitalID: h.hospitalID,
          maleCapacity: Number(h.maleCapacity) || 0,
          femaleCapacity: Number(h.femaleCapacity) || 0,
        }));
        await axios.put(`${API}/${editingID}`, { ...formData, hospitals: hospitalPayload }, { headers });
        // re-fetch to confirm DB values changed
        const statsRes = await axios.get(`${API}/registration-stats?periodID=${editingID}`, { headers });
        setPeriodHospitals(statsRes.data.hospitals || []);
      } else {
        await axios.post(`${API}/open`, { ...formData, activatedBy, hospitals }, { headers });
      }
      setFormData({ name:'', level:'', startDate:'', endDate:'', registrationOpen:'', registrationClose:'' });
      setHospitals([{ ...emptyHospital }]);
      setEditingID(null); setShowForm(false); fetchPeriods();
    } catch (err) {
      const msg = err.response?.data?.message;
      setSubmitError(errorMessages[msg] || msg || 'حدث خطأ');
    }
  };

  const closeForm = () => { setShowForm(false); setEditingID(null); setSubmitError(''); };

  return (
    <div dir="rtl" style={{ padding: '32px', minHeight: '100vh', background: P_LT }}>

      <PageHeader icon={MdDateRange} title="فترات التدريب" subtitle="إنشاء وإدارة فترات التدريب التعاوني">
        <button onClick={() => { setShowForm(true); setEditingID(null); setFormData({name:'',level:'',startDate:'',endDate:'',registrationOpen:'',registrationClose:''}); setHospitals([{...emptyHospital}]); setSubmitError(''); }} style={{
          display:'flex', alignItems:'center', gap:'8px', whiteSpace:'nowrap',
          background:P, color:'#fff', border:'none', borderRadius:'10px', padding:'10px 20px',
          cursor:'pointer', fontWeight:600, fontSize:'14px', fontFamily:'inherit',
        }}>
          <MdAdd size={18}/> فتح فترة جديدة
        </button>
        <button onClick={fetchPeriods} style={{
          display:'flex', alignItems:'center', gap:'8px',
          background:'#fff', color:'#374151', border:'1px solid #d1d5db', borderRadius:'10px', padding:'10px 16px',
          cursor:'pointer', fontWeight:600, fontSize:'14px', fontFamily:'inherit',
        }}>
          <MdRefresh size={18}/> تحديث
        </button>
      </PageHeader>

      {/* Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
          onClick={e => { if(e.target===e.currentTarget) closeForm(); }}>
          <div style={{ background:'#fff', borderRadius:'16px', width:'min(700px,100%)', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            {/* Modal Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', borderBottom:'1px solid #f3f4f6' }}>
              <h2 style={{ margin:0, fontSize:'16px', fontWeight:700, color:'#111827', whiteSpace:'nowrap' }}>
                {editingID ? 'تعديل بيانات الفترة' : 'فتح فترة تدريب جديدة'}
              </h2>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div style={{ padding:'24px 28px' }}>
                <div style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' }}>اسم الفترة *</label>
                  <input style={inputStyle} placeholder="المستوى 5 — التدريب الربيعي 1447"
                    value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} />
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' }}>المستوى *</label>
                  <select style={inputStyle} value={formData.level} onChange={e => setFormData({...formData, level:e.target.value})}>
                    <option value="">اختر المستوى</option>
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'16px' }}>
                  {[['startDate','بداية التدريب *'],['endDate','نهاية التدريب *'],['registrationOpen','فتح التسجيل *'],['registrationClose','إغلاق التسجيل *']].map(([key,lbl]) => (
                    <div key={key}>
                      <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' }}>{lbl}</label>
                      <input type="date" style={inputStyle} value={formData[key]}
                        onChange={e => setFormData({...formData, [key]:e.target.value})} />
                    </div>
                  ))}
                </div>

                {/* قسم المستشفيات — إنشاء جديد */}
                {!editingID && (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                      <label style={{ fontSize:'13px', fontWeight:600, color:'#374151' }}>المستشفيات</label>
                      <button type="button" onClick={() => setHospitals([...hospitals, {...emptyHospital}])} style={{
                        background:P_LT, color:P, border:`1px solid ${P_MD}`, borderRadius:'8px',
                        padding:'5px 12px', cursor:'pointer', fontSize:'12px', fontFamily:'inherit',
                      }}>+ إضافة</button>
                    </div>
                    {hospitals.map((h, idx) => (
                      <div key={idx} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:'8px', marginBottom:'8px', alignItems:'center' }}>
                        <select style={inputStyle} value={h.hospitalID}
                          onChange={e => { const l=[...hospitals]; l[idx]={...l[idx],hospitalID:e.target.value}; setHospitals(l); }}>
                          <option value="">اختر مستشفى</option>
                          {hospitalsList.map(hosp => {
                            const used = hospitals.some((r,i) => i!==idx && String(r.hospitalID)===String(hosp.hospitalID));
                            return <option key={hosp.hospitalID} value={hosp.hospitalID} disabled={used}>{hosp.name}</option>;
                          })}
                        </select>
                        {[['maleCapacity','ذكور'],['femaleCapacity','إناث']].map(([field,lbl]) => (
                          <input key={field} type="number" style={inputStyle} placeholder={lbl} value={h[field]}
                            onChange={e => { const l=[...hospitals]; l[idx]={...l[idx],[field]:e.target.value}; setHospitals(l); }} />
                        ))}
                        <button type="button" onClick={() => setHospitals(hospitals.filter((_,i)=>i!==idx))} style={{
                          background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca',
                          borderRadius:'8px', padding:'8px', cursor:'pointer',
                        }}><MdDelete size={15}/></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* قسم المستشفيات — تعديل فترة موجودة */}
                {editingID && (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                      <label style={{ fontSize:'13px', fontWeight:600, color:'#374151' }}>المستشفيات</label>
                    </div>

                    {/* المستشفيات الحالية — نفس grid شكل الإنشاء */}
                    {periodHospitals.map((h, idx) => (
                      <div key={h.opportunityID} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:'8px', marginBottom:'8px', alignItems:'center' }}>
                        <select style={inputStyle} value={h.hospitalID} disabled>
                          <option value={h.hospitalID}>{h.hospitalName}</option>
                        </select>
                        <input type="number" style={inputStyle} placeholder="ذكور" value={h.maleCapacity}
                          onChange={e => { const l=[...periodHospitals]; l[idx]={...l[idx],maleCapacity:e.target.value}; setPeriodHospitals(l); }} />
                        <input type="number" style={inputStyle} placeholder="إناث" value={h.femaleCapacity}
                          onChange={e => { const l=[...periodHospitals]; l[idx]={...l[idx],femaleCapacity:e.target.value}; setPeriodHospitals(l); }} />
                        <button type="button" onClick={() => handleRemoveHospital(h.hospitalID)} style={{
                          background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca',
                          borderRadius:'8px', padding:'8px', cursor:'pointer',
                        }}><MdDelete size={15}/></button>
                      </div>
                    ))}

                    {/* صف إضافة مستشفى جديد */}
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:'8px', alignItems:'center' }}>
                      <select style={inputStyle} value={newHospital.hospitalID}
                        onChange={e => setNewHospital({...newHospital, hospitalID:e.target.value})}>
                        <option value="">اختر مستشفى</option>
                        {hospitalsList.filter(h => !periodHospitals.some(ph => String(ph.hospitalID)===String(h.hospitalID))).map(hosp => (
                          <option key={hosp.hospitalID} value={hosp.hospitalID}>{hosp.name}</option>
                        ))}
                      </select>
                      <input type="number" style={inputStyle} placeholder="ذكور" value={newHospital.maleCapacity}
                        onChange={e => setNewHospital({...newHospital, maleCapacity:e.target.value})} />
                      <input type="number" style={inputStyle} placeholder="إناث" value={newHospital.femaleCapacity}
                        onChange={e => setNewHospital({...newHospital, femaleCapacity:e.target.value})} />
                      <button type="button" onClick={handleAddHospital} style={{
                        background:P_LT, color:P, border:`1px solid ${P_MD}`,
                        borderRadius:'8px', padding:'8px 12px', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', whiteSpace:'nowrap',
                      }}>+ إضافة</button>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', marginTop:'14px', color:'#b91c1c', fontSize:'13px' }}>
                    <MdWarning size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} /> {submitError}
                  </div>
                )}
              </div>
              {/* Modal Footer */}
              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-start', padding:'16px 28px', borderTop:'1px solid #f3f4f6' }}>
                <button type="button" onClick={closeForm} style={{
                  background:'#fff', color:'#374151', border:'1px solid #e5e7eb', borderRadius:'10px',
                  padding:'9px 20px', cursor:'pointer', fontWeight:600, fontSize:'13px', fontFamily:'inherit',
                }}>إلغاء</button>
                <button type="submit" style={{
                  background:P, color:'#fff', border:'none', borderRadius:'10px',
                  padding:'9px 20px', cursor:'pointer', fontWeight:600, fontSize:'13px', fontFamily:'inherit',
                }}>{editingID ? 'حفظ التعديلات' : 'حفظ الفترة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <AlertBox type="error" message={error} onClose={() => setError('')} />}

      {/* Table Card */}
      {(() => {
        const counts = {
          ALL:       periods.length,
          OPEN:      periods.filter(p => p.status === 'OPEN').length,
          CLOSED:    periods.filter(p => p.status === 'CLOSED').length,
          ALLOCATED: periods.filter(p => p.status === 'ALLOCATED').length,
        };
        const filtered = periods.filter(p => {
          if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
          if (activeFilter === 'OPEN'      && p.status !== 'OPEN')      return false;
          if (activeFilter === 'CLOSED'    && p.status !== 'CLOSED')    return false;
          if (activeFilter === 'ALLOCATED' && p.status !== 'ALLOCATED') return false;
          return true;
        });
        const tabs = [
          { key:'ALL',       label:'الكل',    count: counts.ALL       },
          { key:'OPEN',      label:'مفتوحة',  count: counts.OPEN      },
          { key:'CLOSED',    label:'مغلقة',   count: counts.CLOSED    },
          { key:'ALLOCATED', label:'موزَّعة', count: counts.ALLOCATED },
        ];
        return (
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', overflowX:'auto' }}>
            {/* Toolbar */}
            <div style={{ padding:'16px 24px', borderBottom:'1px solid #f3f4f6' }}>
              {/* Filter tabs */}
              <div style={{ marginBottom:'14px' }}>
                <FilterTabs tabs={tabs} active={activeFilter} onChange={setActiveFilter} />
              </div>
              {/* Search */}
              <div style={{ position:'relative' }}>
                <MdSearch size={18} color="#9ca3af" style={{ position:'absolute', top:'50%', right:'12px', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input type="text" placeholder="ابحث باسم الفترة..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ ...inputStyle, paddingRight:'38px', background:'#fafafa' }} />
              </div>
            </div>

            {loading ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#9ca3af' }}>جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'64px 24px', textAlign:'center' }}>
                <div style={{ width:64, height:64, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <MdDateRange size={30} color="#d1d5db" />
                </div>
                <p style={{ margin:0, fontSize:'15px', fontWeight:600, color:'#374151' }}>لا توجد فترات</p>
                <p style={{ margin:'6px 0 0', fontSize:'13px', color:'#9ca3af' }}>
                  {search ? 'لا توجد نتائج تطابق بحثك' : 'اضغط "إنشاء فترة" لإضافة فترة تدريبية جديدة'}
                </p>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', direction:'rtl' }}>
                <thead>
                  <tr style={{ background:'#f9fafb' }}>
                    {['اسم الفترة','المستوى','بداية التدريب','نهاية التدريب','بداية التسجيل','نهاية التسجيل','الحالة','إجراءات'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'right', fontSize:'12px', fontWeight:600, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(period => {
                    const st = getRegStatus(period);
                    const canEdit = new Date() < new Date(period.registrationOpen);
                    return (
                      <tr key={period.periodID} style={{ borderBottom:'1px solid #f3f4f6' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'14px 16px', fontSize:'14px', fontWeight:600, color:'#111827' }}>{period.name}</td>
                        <td style={{ padding:'14px 16px' }}>
                          <span style={{ background:P_LT, color:P, borderRadius:'20px', padding:'3px 10px', fontSize:'12px', fontWeight:600 }}>{fmtLevel(period.level)}</span>
                        </td>
                        {[period.startDate, period.endDate, period.registrationOpen, period.registrationClose].map((d,i) => (
                          <td key={i} style={{ padding:'14px 16px', fontSize:'13px', color:'#374151' }}>{fmtDate(d)}</td>
                        ))}
                        <td style={{ padding:'14px 16px' }}>
                          <span style={{ background:st.bg, color:st.cls, borderRadius:'20px', padding:'4px 12px', fontSize:'12px', fontWeight:600 }}>{st.label}</span>
                        </td>
                        <td style={{ padding:'14px 16px' }}>
                          {canEdit ? (
                            <div style={{ display:'flex', gap:'8px' }}>
                              <button onClick={() => handleEdit(period)} style={{ display:'flex', alignItems:'center', gap:'5px', background:P_LT, color:P, border:`1px solid ${P_MD}`, borderRadius:'8px', padding:'6px 12px', cursor:'pointer', fontSize:'13px', fontFamily:'inherit' }}>
                                <MdEdit size={15}/> تعديل
                              </button>
                              <button onClick={() => handleDelete(period)} style={{ display:'flex', alignItems:'center', gap:'5px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', fontSize:'13px', fontFamily:'inherit' }}>
                                <MdDelete size={15}/> حذف
                              </button>
                            </div>
                          ) : <span style={{ color:'#9ca3af', fontSize:'13px' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })()}
    </div>
  );
}
