// إدارة المستشفيات — TailAdmin RTL style
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocalHospital, MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

const API    = 'http://localhost:3000/api/coordinator/hospitals';
const P      = '#2d8a56';
const P_LT   = '#ecfdf5';
const P_MD   = '#d1fae5';

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', background: '#fafafa', direction: 'rtl',
};

export default function HospitalsPage() {
  const [hospitals, setHospitals]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [formData, setFormData]     = useState({ name: '', location: '' });
  const [editingID, setEditingID]   = useState(null);
  const [submitError, setSubmitError] = useState('');

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchHospitals(); }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { headers });
      setHospitals(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEdit = (h) => {
    setEditingID(h.hospitalID);
    setFormData({ name: h.name, location: h.location });
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
      if (original?.name === formData.name && original?.location === formData.location) {
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
      setFormData({ name: '', location: '' });
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
    setFormData({ name: '', location: '' });
    setSubmitError('');
  };

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
            <MdLocalHospital size={22} color={P} />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>إدارة المستشفيات</h1>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6b7280' }}>إضافة ومتابعة المستشفيات المشاركة في التدريب</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) closeForm(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: showForm ? '#f3f4f6' : P, color: showForm ? '#374151' : '#fff',
            border: 'none', borderRadius: '10px', padding: '10px 18px',
            cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
          }}
        >
          {showForm ? <><MdClose size={18} /> إغلاق</> : <><MdAdd size={18} /> إضافة مستشفى</>}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: '#fff', borderRadius: '16px', border: `1px solid ${P_MD}`,
          padding: '24px 28px', marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(45,138,86,0.08)',
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
            {editingID ? 'تعديل بيانات المستشفى' : 'بيانات المستشفى الجديد'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
            </div>
            {submitError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#b91c1c', fontSize: '13px' }}>
                ⚠️ {submitError}
              </div>
            )}
            <button type="submit" style={{
              background: P, color: '#fff', border: 'none', borderRadius: '10px',
              padding: '10px 24px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {editingID ? 'حفظ التعديلات' : 'حفظ المستشفى'}
            </button>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>المستشفيات المسجلة</h3>
          <span style={{ background: P_LT, color: P, borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: 600 }}>
            {hospitals.length} مستشفى
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>جاري التحميل...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'اسم المستشفى', 'الموقع', 'تاريخ الإضافة', 'الإجراءات'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hospitals.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>لا توجد مستشفيات مسجلة</td></tr>
              ) : hospitals.map((h, i) => (
                <tr key={h.hospitalID} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{i + 1}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: P_LT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MdLocalHospital size={16} color={P} />
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{h.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>{h.location}</td>
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
