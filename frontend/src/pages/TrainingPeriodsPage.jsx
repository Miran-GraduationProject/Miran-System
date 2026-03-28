//  بصفحة المنسق فيه خانة اسمها ادارة الفترات التدريبية هذي هي
// بكل اختصار رز يضغطه فيه انشاء فترة ويعبي البيانات مع كل خطا يطلع رسالة 
// ثم يحفظها وتنعرض قدامه كل الفترات ويقدر يعدلها اذا كانت قبل بدء تاريخ التسجيل


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../styles/trainingPeriods.css';

const API = 'http://localhost:3000/api/coordinator/training-period';

const getRegStatus = (period) => {
  // تحدد حالة الفترة وتكبت جنبها الجملة المناسبة
  const now = new Date();
  if (period.status === 'ALLOCATED') return { label: 'تم التوزيع', cls: 'status-ALLOCATED' };
  if (now < new Date(period.registrationOpen)) return { label: 'لم يبدأ التسجيل بعد', cls: 'status-NOT-OPEN' };
  if (now <= new Date(period.registrationClose)) return { label: 'التسجيل مفتوح', cls: 'status-OPEN' };
  return { label: 'التسجيل مغلق', cls: 'status-CLOSED' };
};

const errorMessages = {
  //ترجمة رسايل الايرورز من الباك  ايند للصفحة
  'All fields are required': 'جميع الحقول مطلوبة، تأكد من تعبئة كل البيانات',
  'End date must be after start date': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
  'Registration close date must be after open date': 'تاريخ إغلاق التسجيل يجب أن يكون بعد تاريخ فتحه',
  'Invalid hospital data, please check and try again': 'بيانات المستشفى غير مكتملة، تأكد من اختيار المستشفى وإدخال رقم السكرتير والسعات',
  'A training period for this level is already open': 'يوجد فترة تدريبية مفتوحة لهذا المستوى بالفعل',
  'One or more hospitals or secretaries were not found in the system': 'أحد المستشفيات أو السكرتيرات غير موجود في النظام، تحقق من الأرقام المدخلة',
  'Duplicate hospitals are not allowed': 'لا يمكن إضافة نفس المستشفى مرتين في الفترة ذاتها',
  'Cannot delete period after registration has opened': 'لا يمكن حذف الفترة بعد بدء التسجيل',
  'This training period already exists': 'هذه الفترة التدريبية موجودة مسبقاً',
  'Database connection failed, please try again later': 'تعذر الاتصال بقاعدة البيانات، حاول مرة أخرى لاحقاً',
};

// مستويات الطلاب وتجي على شكل قائمة (خيارات )
const levels = [1,2,3,4,5,6,7,8,9,10];
 //من اسم كذ بيكون شكل صف المتشفى وهو واضي والمنسق يعبيه 
const emptyHospital = { hospitalID: '', secretaryID: '', maleCapacity: '', femaleCapacity: '' };

function TrainingPeriodsPage() {
  const [showForm, setShowForm] = useState(false); // لما اضغط على زر اضافة يطلع الفورم
  const [editingID, setEditingID] = useState(null); 
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [hospitalsList, setHospitalsList] = useState([]);

  // نجيب التوكن من الستوريج ونفك تشفيره عشان ناخذ منه الاي دي تبع المنسق
  // الاي دي هذا بنحتاجه لما ننشي فترة جديدة كـ activatedBy
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const activatedBy = decoded?.id;

  const [formData, setFormData] = useState({
    name: '',
    level: '',
    startDate: '',
    endDate: '',
    registrationOpen: '',
    registrationClose: '',
  });

  const [hospitals, setHospitals] = useState([emptyHospital]);

  useEffect(() => {
    fetchCurrentPeriod();
    fetchHospitalsList();
  }, []);

  const fetchHospitalsList = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/coordinator/hospitals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHospitalsList(res.data.hospitals || []);
    } catch (err) {
      console.error('fetchHospitalsList error:', err);
    }
  };

  const fetchCurrentPeriod = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/all-periods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPeriods(res.data.periods || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('تعذر تحميل بيانات الفترات');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handleHospitalChange = (index, e) => {
    const list = [...hospitals];
    list[index] = { ...list[index], [e.target.name]: e.target.value };
    setHospitals(list);
  };

  const addHospital = () => {
    setHospitals([...hospitals, { ...emptyHospital }]);
  };

  const removeHospital = (index) => {
    setHospitals(hospitals.filter((_, i) => i !== index));
  };

  const handleDelete = async (period) => {
    if (!window.confirm(`هل تريد حذف الفترة "${period.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    try {
      await axios.delete(`${API}/${period.periodID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPeriods(periods.filter(p => p.periodID !== period.periodID));
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(errorMessages[msg] || msg || 'تعذر حذف الفترة');
    }
  };

  const handleEdit = (period) => {
    setEditingID(period.periodID);
    setFormData({
      name: period.name,
      level: period.level || '',
      startDate: period.startDate?.slice(0, 10),
      endDate: period.endDate?.slice(0, 10),
      registrationOpen: period.registrationOpen?.slice(0, 10),
      registrationClose: period.registrationClose?.slice(0, 10),
    });
    setShowForm(true);
    setSubmitError('');
  };

  // هنا بيانات الفورم تروح للباكايند
  // 
  // بعد ما نضغط حفظ او تعديل نصفر الفورم ونقفله وتنعرض بالصفحة الفترات من جديد 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (editingID) {
        await axios.put(
          `${API}/${editingID}`,
          { ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/open`,
          { ...formData, activatedBy, hospitals },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setFormData({ name: '', level: '', startDate: '', endDate: '', registrationOpen: '', registrationClose: '' });
      setHospitals([{ ...emptyHospital }]);
      setEditingID(null);
      setShowForm(false);
      fetchCurrentPeriod();
    } catch (err) {
      const msg = err.response?.data?.message;
      setSubmitError(errorMessages[msg] || msg || 'حدث خطأ، حاول مرة أخرى');
    }
  };

  return (
    <div className="periods-page" dir="rtl">
      <div className="periods-header">
        <div>
          <h1>إدارة فترات التدريب</h1>
          <p>إنشاء ومتابعة الفترات التدريبية وحالة التسجيل</p>
        </div>
        <button className="create-period-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'إغلاق النموذج' : 'إنشاء فترة تدريبية'}
        </button>
      </div>

      {showForm && (
        <form className="period-form" onSubmit={handleSubmit}>
          <h3>{editingID ? 'تعديل بيانات الفترة التدريبية' : 'بيانات الفترة التدريبية'}</h3>

          <div className="form-grid-name">
            <div>
              <label>اسم الفترة</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: الفترة الصيفية 2026"
              />
            </div>
            <div>
              <label>المستوى الدراسي</label>
              <select name="level" value={formData.level} onChange={handleChange}>
                <option value="">اختر المستوى</option>
                {levels.map(l => (
                  <option key={l} value={`المستوى ${l}`}>المستوى {l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label>تاريخ بداية التدريب</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>
            <div>
              <label>تاريخ نهاية التدريب</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
            <div>
              <label>بداية التسجيل</label>
              <input type="date" name="registrationOpen" value={formData.registrationOpen} onChange={handleChange} />
            </div>
            <div>
              <label>نهاية التسجيل</label>
              <input type="date" name="registrationClose" value={formData.registrationClose} onChange={handleChange} />
            </div>
          </div>

          <div className="hospitals-section">
            <h3>المستشفيات في هذه الفترة</h3>

            {hospitals.map((hospital, index) => (
              <div className="hospital-row" key={index}>
                <select
                  name="hospitalID"
                  value={hospital.hospitalID}
                  onChange={(e) => handleHospitalChange(index, e)}
                >
                  <option value="">اختر مستشفى</option>
                  {hospitalsList.map((h) => {
                    // نشيك لو المستشفى هذا اتاختار بصف ثاني عشان نعطله ونكتب جنبه مضاف مسبقاً
                    const usedElsewhere = hospitals.some(
                      (row, i) => i !== index && String(row.hospitalID) === String(h.hospitalID)
                    );
                    return (
                      <option key={h.hospitalID} value={h.hospitalID} disabled={usedElsewhere}>
                        {h.name}{usedElsewhere ? ' (مضاف مسبقاً)' : ''}
                      </option>
                    );
                  })}
                </select>

                <input
                  type="number"
                  name="secretaryID"
                  value={hospital.secretaryID}
                  onChange={(e) => handleHospitalChange(index, e)}
                  placeholder="رقم السكرتير"
                />

                <input
                  type="number"
                  name="maleCapacity"
                  value={hospital.maleCapacity}
                  onChange={(e) => handleHospitalChange(index, e)}
                  placeholder="سعة الذكور"
                />

                <input
                  type="number"
                  name="femaleCapacity"
                  value={hospital.femaleCapacity}
                  onChange={(e) => handleHospitalChange(index, e)}
                  placeholder="سعة الإناث"
                />

                <button type="button" className="delete-btn" onClick={() => removeHospital(index)}>
                  حذف
                </button>
              </div>
            ))}

            <button type="button" className="add-hospital-btn" onClick={addHospital}>
              + إضافة مستشفى
            </button>
          </div>

          {submitError && <div className="submit-error">⚠️ {submitError}</div>}

          <button type="submit" className="save-btn">
            {editingID ? 'حفظ التعديلات' : 'حفظ الفترة'}
          </button>
        </form>
      )}

      <div className="periods-table-box">
        <h3>الفترات التدريبية</h3>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <table className="periods-table">
            <thead>
              <tr>
                <th>اسم الفترة</th>
                <th>المستوى</th>
                <th>تاريخ البداية</th>
                <th>تاريخ النهاية</th>
                <th>بداية التسجيل</th>
                <th>نهاية التسجيل</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {periods.length > 0 ? periods.map(period => (
                <tr key={period.periodID}>
                  <td>{period.name}</td>
                  <td><span className="level-badge">{period.level}</span></td>
                  <td>{new Date(period.startDate).toLocaleDateString('ar-SA')}</td>
                  <td>{new Date(period.endDate).toLocaleDateString('ar-SA')}</td>
                  <td>{new Date(period.registrationOpen).toLocaleDateString('ar-SA')}</td>
                  <td>{new Date(period.registrationClose).toLocaleDateString('ar-SA')}</td>
                  <td>
                    {(() => {
                      const reg = getRegStatus(period);
                      return <span className={`status-badge ${reg.cls}`}>{reg.label}</span>;
                    })()}
                  </td>
                  {/* ازرار التعديل والحذف تظهر بس لو التسجيل ما بدا بعد وإلا نحط شرطة */}
                  <td className="actions-cell">
                    {new Date() < new Date(period.registrationOpen) ? (
                      <>
                        <button className="edit-btn" onClick={() => handleEdit(period)}>تعديل</button>
                        <button className="delete-btn" onClick={() => handleDelete(period)}>حذف</button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>لا توجد فترات تدريبية مفتوحة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {error && (
          <div className="table-error">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainingPeriodsPage;
