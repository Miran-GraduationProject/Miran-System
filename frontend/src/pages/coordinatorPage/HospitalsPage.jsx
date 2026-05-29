// إدارة المستشفيات
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocalHospital, MdAdd, MdEdit, MdDelete, MdRefresh, MdSearch } from 'react-icons/md';

const API  = 'http://localhost:3000/api/coordinator/hospitals';
const P    = '#2d8a56';
const P_LT = '#ecfdf5';
const P_MD = '#d1fae5';

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', background: '#fafafa', direction: 'rtl', boxSizing: 'border-box',
};

export default function HospitalsPage() {
  const [hospitals, setHospitals]     = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [formData, setFormData]       = useState({ name: '', location: '', supervisorID: '' });
  const [editingID, setEditingID]     = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [search, setSearch]           = useState('');
  const [cityFilter, setCityFilter]   = useState('');

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchHospitals(); fetchSupervisors(); }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { headers });
      setHospitals(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await axios.get(`${API}/supervisors`, { headers });
      setSupervisors(res.data);
    } catch (err) { console.error(err); }
  };

  const handleEdit = (h) => {
    setEditingID(h.hospitalID);
    setFormData({ name: h.name, location: h.location, supervisorID: h.supervisorID || '' });
    setShowForm(true);
    setSubmitError('');
  };

  const handleDelete = async (hospitalID) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستشفى؟')) return;
    try {
      await axios.delete(`${API}/${hospitalID}`, { headers });
      fetchHospitals();
    } catch (err) { alert(err.response?.data?.message || 'حدث خطأ أثناء الحذف'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (editingID) {
      const original = hospitals.find(h => h.hospitalID === editingID);
      if (
        original?.name === formData.name &&
        original?.location === formData.location &&
        String(original?.supervisorID || '') === String(formData.supervisorID || '')
      ) {
        setSubmitError('لم تقم بأي تغييرات');
        return;
      }
    }
    try {
      if (editingID) {
        await axios.put(`${API}/${editingID}`, formData, { headers });
      } else {
        await axios.post(API, formData, { headers });
      }
      setFormData({ name: '', location: '', supervisorID: '' });
      setEditingID(null);
      setShowForm(false);
      fetchHospitals();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingID(null);
    setFormData({ name: '', location: '', supervisorID: '' });
    setSubmitError('');
  };

  // Stats
  const cities    = [...new Set(hospitals.map(h => h.location))];
  const lastAdded = hospitals.length > 0
    ? hospitals.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    : null;

  // Filtered
  const filtered = hospitals.filter(h => {
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
    const matchCity   = !cityFilter || h.location === cityFilter;
    return matchSearch && matchCity;
  });

  return (
    <div dir="rtl" style={{ padding: '32px', minHeight: '100vh', background: '#f3f4f6' }}>

      {/* Header */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
        padding: '20px 24px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: P_LT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MdLocalHospital size={22} color={P} />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>إدارة المستشفيات</h1>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6b7280' }}>إضافة ومتابعة المستشفيات المشاركة في التدريب</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => { setShowForm(true); setEditingID(null); setFormData({ name: '', location: '', supervisorID: '' }); setSubmitError(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              background: P, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px',
              cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
            }}
          >
            <MdAdd size={18} /> إضافة مستشفى
          </button>
          <button
            onClick={fetchHospitals}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 16px',
              cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
            }}
          >
            <MdRefresh size={18} /> تحديث
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '42px', lineHeight: 1 }}>🏥</span>
          <p style={{ margin: '14px 0 6px', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>إجمالي المستشفيات</p>
          <p style={{ margin: '0 0 4px', fontSize: '30px', fontWeight: 700, color: '#111827' }}>{hospitals.length}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>في منظومة التدريب</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '42px', lineHeight: 1 }}>📍</span>
          <p style={{ margin: '14px 0 6px', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>المدن المشاركة</p>
          <p style={{ margin: '0 0 4px', fontSize: '30px', fontWeight: 700, color: '#111827' }}>{cities.length}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>منطقة جغرافية</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '42px', lineHeight: 1 }}>📅</span>
          <p style={{ margin: '14px 0 6px', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>آخر إضافة</p>
          <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: '#111827' }}>
            {lastAdded ? new Date(lastAdded.createdAt).toLocaleDateString('ar-SA') : '—'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>تاريخ الإضافة</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: '#fff', borderRadius: '16px', border: `1px solid ${P_MD}`,
          padding: '24px 28px', marginBottom: '16px',
          boxShadow: '0 4px 16px rgba(45,138,86,0.08)',
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
            {editingID ? 'تعديل بيانات المستشفى' : 'بيانات المستشفى الجديد'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>اسم المستشفى</label>
                <input style={inputStyle} placeholder="مثال: مستشفى الملك فهد"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>الموقع</label>
                <input style={inputStyle} placeholder="مثال: مكة المكرمة"
                  value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>المشرف الأكاديمي</label>
                <select style={inputStyle} value={formData.supervisorID} onChange={e => setFormData({ ...formData, supervisorID: e.target.value })}>
                  <option value="">اختر المشرف</option>
                  {supervisors.map(s => (
                    <option key={s.userID} value={s.userID}>
                      {s.firstName} {s.secondName || ''} {s.lastName} - {s.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {submitError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#b91c1c', fontSize: '13px' }}>
                ⚠️ {submitError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={closeForm} style={{
                background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '9px 20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
              }}>إلغاء</button>
              <button type="submit" style={{
                background: P, color: '#fff', border: 'none', borderRadius: '10px',
                padding: '9px 24px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {editingID ? 'حفظ التعديلات' : 'حفظ المستشفى'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Filter */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
        padding: '14px 20px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MdSearch size={18} color="#9ca3af" style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="ابحث باسم المستشفى أو المدينة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingRight: '38px' }}
          />
        </div>
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          style={{ ...inputStyle, width: '180px' }}
        >
          <option value="">كل المدن</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {filtered.length} من {hospitals.length}
        </span>
      </div>

      {/* Table Card */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <MdLocalHospital size={30} color="#d1d5db" />
            </div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#374151' }}>لا توجد مستشفيات</p>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#9ca3af' }}>
              {search || cityFilter ? 'لا توجد نتائج تطابق بحثك' : 'اضغط "إضافة مستشفى" لإضافة مستشفى جديد'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'اسم المستشفى', 'الموقع', 'المشرف', 'تاريخ الإضافة', 'الإجراءات'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={h.hospitalID} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{i + 1}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: P_LT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MdLocalHospital size={16} color={P} />
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{h.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>{h.location}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>
                    {h.supervisorFirstName
                      ? `${h.supervisorFirstName} ${h.supervisorLastName || ''}`
                      : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>غير محدد</span>}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>
                    {new Date(h.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(h)} style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: P_LT, color: P, border: `1px solid ${P_MD}`,
                        borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                      }}><MdEdit size={15} /> تعديل</button>
                      <button onClick={() => handleDelete(h.hospitalID)} style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                        borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                      }}><MdDelete size={15} /> حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
