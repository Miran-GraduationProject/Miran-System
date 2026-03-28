//  بصفحة المنسق فيه خانة اسمها الفرص  التدريبية الموكدةهذي هي

import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/confirmedAllocations.css';

const BASE = 'http://localhost:3000/api/coordinator/training-period';

function ConfirmedAllocationsPage() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodID, setSelectedPeriodID] = useState(null);
  const [periodDetail, setPeriodDetail] = useState(null);   // { period, hospitals }
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodID) fetchDetail(selectedPeriodID);
  }, [selectedPeriodID]);

  const fetchPeriods = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BASE}/allocated-periods`, { headers });
      const list = res.data.periods || [];
      setPeriods(list);
      if (list.length > 0) setSelectedPeriodID(list[0].periodID);
    } catch {
      setError('تعذر تحميل الفترات');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (periodID) => {
    setDetailLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BASE}/${periodID}/confirmed-allocations`, { headers });
      setPeriodDetail(res.data);
    } catch {
      setError('تعذر تحميل بيانات الفترة');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const totalEnrolled = periodDetail
    ? periodDetail.hospitals.reduce((s, h) => s + h.students.length, 0)
    : 0;
  const totalMale = periodDetail
    ? periodDetail.hospitals.reduce((s, h) => s + h.students.filter(st => st.gender === 'Male').length, 0)
    : 0;
  const totalFemale = periodDetail
    ? periodDetail.hospitals.reduce((s, h) => s + h.students.filter(st => st.gender === 'Female').length, 0)
    : 0;

  return (
    <div className="ca-page" dir="rtl">
      <div className="ca-header">
        <div>
          <h1>فرص التدريب المؤكدة</h1>
          <p>نتائج توزيع الطلاب على المستشفيات بعد التأكيد النهائي</p>
        </div>
      </div>

      {error && <div className="ca-error">{error}</div>}

      {loading ? (
        <p className="ca-empty">جاري التحميل...</p>
      ) : periods.length === 0 ? (
        <div className="ca-notice">لا توجد فترات تدريبية مؤكدة حتى الآن</div>
      ) : (
        <>
          {/* Period selector */}
          <div className="ca-period-selector">
            <label>الفترة التدريبية:</label>
            <select
              value={selectedPeriodID}
              onChange={e => setSelectedPeriodID(Number(e.target.value))}
              className="ca-select"
            >
              {periods.map(p => (
                <option key={p.periodID} value={p.periodID}>{p.name} — {p.level || ''}</option>
              ))}
            </select>
            <button className="ca-print-btn" onClick={() => window.print()}>طباعة</button>
          </div>

          {detailLoading ? (
            <p className="ca-empty">جاري تحميل التفاصيل...</p>
          ) : periodDetail ? (
            <>
              {/* Period Info Card */}
              <div className="ca-period-card">
                <div className="ca-period-card-top">
                  <div className="ca-period-info">
                    <h2>{periodDetail.period.name}</h2>
                    <span className="ca-badge-allocated">✓ تم التوزيع</span>
                  </div>
                </div>
                <div className="ca-period-dates">
                  <div className="ca-date-item">
                    <span className="ca-date-label">بداية التدريب</span>
                    <span className="ca-date-val">{formatDate(periodDetail.period.startDate)}</span>
                  </div>
                  <div className="ca-date-item">
                    <span className="ca-date-label">نهاية التدريب</span>
                    <span className="ca-date-val">{formatDate(periodDetail.period.endDate)}</span>
                  </div>
                  <div className="ca-date-item">
                    <span className="ca-date-label">بداية التسجيل</span>
                    <span className="ca-date-val">{formatDate(periodDetail.period.registrationOpen)}</span>
                  </div>
                  <div className="ca-date-item">
                    <span className="ca-date-label">نهاية التسجيل</span>
                    <span className="ca-date-val">{formatDate(periodDetail.period.registrationClose)}</span>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="ca-summary">
                <div className="ca-stat-card ca-stat-total">
                  <span className="ca-stat-num">{totalEnrolled}</span>
                  <span className="ca-stat-lbl">إجمالي الطلاب الملتحقين</span>
                </div>
                <div className="ca-stat-card ca-stat-male">
                  <span className="ca-stat-num">{totalMale}</span>
                  <span className="ca-stat-lbl">الطلاب الذكور</span>
                </div>
                <div className="ca-stat-card ca-stat-female">
                  <span className="ca-stat-num">{totalFemale}</span>
                  <span className="ca-stat-lbl">الطالبات الإناث</span>
                </div>
                <div className="ca-stat-card ca-stat-hospitals">
                  <span className="ca-stat-num">{periodDetail.hospitals.length}</span>
                  <span className="ca-stat-lbl">عدد المستشفيات</span>
                </div>
              </div>

              {/* Hospital Sections */}
              {periodDetail.hospitals.length === 0 ? (
                <div className="ca-notice">لا يوجد طلاب ملتحقون في هذه الفترة</div>
              ) : periodDetail.hospitals.map((hosp) => {
                const maleStudents = hosp.students.filter(s => s.gender === 'Male');
                const femaleStudents = hosp.students.filter(s => s.gender === 'Female');

                return (
                  <div className="ca-hospital-section" key={hosp.opportunityID}>
                    <div className="ca-hospital-header">
                      <div className="ca-hospital-title">
                        <span className="ca-hospital-icon">🏥</span>
                        <h3>{hosp.hospitalName}</h3>
                      </div>
                      <div className="ca-hospital-caps">
                        <span className="ca-cap-badge ca-cap-male">
                          ذكور: {maleStudents.length}/{hosp.maleCapacity}
                        </span>
                        <span className="ca-cap-badge ca-cap-female">
                          إناث: {femaleStudents.length}/{hosp.femaleCapacity}
                        </span>
                        <span className="ca-cap-badge ca-cap-total">
                          المجموع: {hosp.students.length}
                        </span>
                      </div>
                    </div>

                    <div className="ca-students-grid">
                      {/* Male students */}
                      {maleStudents.length > 0 && (
                        <div className="ca-gender-group">
                          <h4 className="ca-gender-title ca-male-title">👨‍🎓 الطلاب الذكور ({maleStudents.length})</h4>
                          <table className="ca-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>اسم الطالب</th>
                                <th>المعدل</th>
                                <th>تاريخ التسجيل</th>
                              </tr>
                            </thead>
                            <tbody>
                              {maleStudents.map((st, idx) => (
                                <tr key={st.studentID}>
                                  <td>{idx + 1}</td>
                                  <td>{st.firstName} {st.lastName}</td>
                                  <td>{st.universityGPA}</td>
                                  <td>{formatDate(st.enrolledAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Female students */}
                      {femaleStudents.length > 0 && (
                        <div className="ca-gender-group">
                          <h4 className="ca-gender-title ca-female-title">👩‍🎓 الطالبات الإناث ({femaleStudents.length})</h4>
                          <table className="ca-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>اسم الطالبة</th>
                                <th>المعدل</th>
                                <th>تاريخ التسجيل</th>
                              </tr>
                            </thead>
                            <tbody>
                              {femaleStudents.map((st, idx) => (
                                <tr key={st.studentID}>
                                  <td>{idx + 1}</td>
                                  <td>{st.firstName} {st.lastName}</td>
                                  <td>{st.universityGPA}</td>
                                  <td>{formatDate(st.enrolledAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {hosp.students.length === 0 && (
                        <p className="ca-no-students">لا يوجد طلاب مخصصون لهذا المستشفى</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

export default ConfirmedAllocationsPage;
