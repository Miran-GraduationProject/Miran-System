//  بصفحة المنسق فيه خانة اسمها ادارة المستشفيات هذي هي


import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/trainingPeriods.css';

const API = 'http://localhost:3000/api/coordinator/hospitals';

function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [editingID, setEditingID] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await axios.delete(`${API}/${hospitalID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (editingID) {
      const original = hospitals.find((h) => h.hospitalID === editingID);
      if (original && original.name === formData.name && original.location === formData.location) {
        setSubmitError('لم تقم بأي تغييرات');
        return;
      }
    }

    try {
      if (editingID) {
        await axios.put(`${API}/${editingID}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({ name: '', location: '' });
      setEditingID(null);
      setShowForm(false);
      fetchHospitals();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingID(null);
    setFormData({ name: '', location: '' });
    setSubmitError('');
  };

  return (
    <div className="periods-page" dir="rtl">
      <div className="periods-header">
        <div>
          <h1>إدارة المستشفيات</h1>
          <p>إضافة ومتابعة المستشفيات المشاركة في التدريب</p>
        </div>
        <button className="create-period-btn" onClick={showForm ? handleCloseForm : () => setShowForm(true)}>
          {showForm ? 'إغلاق النموذج' : 'إضافة مستشفى'}
        </button>
      </div>

      {showForm && (
        <form className="period-form" onSubmit={handleSubmit}>
          <h3>{editingID ? 'تعديل بيانات المستشفى' : 'بيانات المستشفى الجديد'}</h3>

          <div className="form-grid">
            <div>
              <label>اسم المستشفى</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: مستشفى الملك فهد"
              />
            </div>
            <div>
              <label>الموقع</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="مثال: مكة المكرمة"
              />
            </div>
          </div>

          {submitError && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '12px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              ⚠️ {submitError}
            </div>
          )}

          <button type="submit" className="save-btn">
            {editingID ? 'حفظ التعديلات' : 'حفظ المستشفى'}
          </button>
        </form>
      )}

      <div className="periods-table-box">
        <h3>المستشفيات المسجلة</h3>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <table className="periods-table">
            <thead>
              <tr>
                <th>#</th>
                <th>اسم المستشفى</th>
                <th>الموقع</th>
                <th>تاريخ الإضافة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.length > 0 ? hospitals.map((h, index) => (
                <tr key={h.hospitalID}>
                  <td>{index + 1}</td>
                  <td>{h.name}</td>
                  <td>{h.location}</td>
                  <td>{new Date(h.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(h)}>تعديل</button>
                    <button className="delete-btn" onClick={() => handleDelete(h.hospitalID)}>حذف</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>لا توجد مستشفيات مسجلة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default HospitalsPage;
