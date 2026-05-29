//  بصفحة طالب فيه خانة اسمها ترتيب الرغبات للفرص التريبية هذي هي
// اول شي تطلع الفترة التدريبية نفس ما المنسق سجلها وبداخلها المستشفيات وهو يرتب
// اذا رتب وسوا حفظ يجي المرة الثانية ويتغير الرز الى تعديل البيانات
// واذا خلصت الفترة التسجيل تظهر له رساله بمعناها انتههى التسجيل بس تقدر تشوف رغباتك


import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/studentPreferences.css';

const BASE = 'http://localhost:3000/api/student';

function StudentPreferencesPage() {
  const [period, setPeriod] = useState(null);
  const [, setHospitals] = useState([]);       // كل المستشفيات المتاحة
  const [ranked, setRanked] = useState([]);             // الترتيب الحالي للطالب
  const [registrationStatus, setRegistrationStatus] = useState('unknown');
  // 'not_open' | 'open' | 'closed'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // نجيب المستشفيات + معلومات الفترة
      const hospRes = await axios.get(`${BASE}/hospitals`, { headers });
      const { periodID, periodName, registrationOpen, registrationClose, hospitals: hosp } = hospRes.data;

      setPeriod({ periodID, name: periodName, registrationOpen, registrationClose });

      // نشوف حالة التجسيل
      const now = new Date();
      const open = new Date(registrationOpen);
      const close = new Date(registrationClose);
      if (now < open) setRegistrationStatus('not_open');
      else if (now > close) setRegistrationStatus('closed');
      else setRegistrationStatus('open');

      setHospitals(hosp);

      // نجيب الترتيب المحفوظ للطالب
      try {
        const prefRes = await axios.get(`${BASE}/preferences`, { headers });
        const saved = prefRes.data.preferences || [];
        if (saved.length > 0) {
          // نرتبها حسب الرانك
          const sortedSaved = [...saved].sort((a, b) => a.preferenceRank - b.preferenceRank);
          setRanked(sortedSaved.map(p => ({
            opportunityID: p.opportunityID,
            hospitalName: p.hospitalName,
          })));
          setHasSaved(true);
        } else {
          // اذا مافي ترتيب من قبل تعرض الترتيب اافتراضي
          setRanked(hosp.map(h => ({
            opportunityID: h.opportunityID,
            hospitalName: h.hospitalName,
          })));
        }
      } catch {
        // لو الطالب ما سجل رغبات قبل كذا نرتب المستشفيات بدون ترتيب محدد
        setRanked(hosp.map(h => ({
          opportunityID: h.opportunityID,
          hospitalName: h.hospitalName,
        })));
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('لا توجد فترة تدريبية مفتوحة حالياً');
      } else {
        setError('تعذر تحميل البيانات');
      }
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...ranked];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setRanked(updated);
  };

  const moveDown = (index) => {
    if (index === ranked.length - 1) return;
    const updated = [...ranked];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setRanked(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const preferences = ranked.map((h, i) => ({
        opportunityID: h.opportunityID,
        preferenceRank: i + 1,
      }));
      await axios.post(`${BASE}/preferences`, { preferences }, { headers });
      setHasSaved(true);
      setSuccess('تم حفظ ترتيب رغباتك بنجاح ✓');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ، حاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const statusInfo = {
    open: { label: 'التسجيل مفتوح', cls: 'status-open' },
    closed: { label: 'التسجيل مغلق', cls: 'status-closed' },
    not_open: { label: 'لم يبدأ التسجيل بعد', cls: 'status-not-open' },
    unknown: { label: '', cls: '' },
  };

  return (
    <div className="sp-page" dir="rtl">
      <div className="sp-header">
        <div>
          <h1>فرص التدريب</h1>
          <p>رتّب المستشفيات من الاعلى الى الاسفل</p>
        </div>
      </div>

      {success && <div className="sp-success">{success}</div>}
      {error && <div className="sp-error">{error}</div>}

      {loading ? (
        <p className="sp-empty">جاري التحميل...</p>
      ) : !period ? null : (
        <>
          {/* Period Info */}
          <div className="sp-period-card">
            <div className="sp-period-info">
              <div>
                <span className="sp-period-label">الفترة التدريبية</span>
                <span className="sp-period-name">{period.name}</span>
              </div>
              <span className={`sp-reg-status ${statusInfo[registrationStatus].cls}`}>
                {statusInfo[registrationStatus].label}
              </span>
            </div>
            <div className="sp-period-dates">
              <div className="sp-date-item">
                <span className="sp-date-label">بداية التسجيل</span>
                <span className="sp-date-val">{formatDate(period.registrationOpen)}</span>
              </div>
              <div className="sp-date-item">
                <span className="sp-date-label">نهاية التسجيل</span>
                <span className="sp-date-val">{formatDate(period.registrationClose)}</span>
              </div>
            </div>
          </div>

          {/* Ranked List */}
          {registrationStatus === 'closed' && (
            <div className="sp-closed-notice">
              🔒 انتهى وقت التسجيل — يمكنك مشاهدة ترتيبك المحفوظ فقط
            </div>
          )}
          {registrationStatus === 'not_open' && (
            <div className="sp-closed-notice sp-not-open-notice">
              ⏳ لم يبدأ التسجيل بعد — يفتح في {formatDate(period.registrationOpen)}
            </div>
          )}

          {ranked.length === 0 ? (
            <p className="sp-empty">لا توجد مستشفيات متاحة في هذه الفترة</p>
          ) : (
            <div className="sp-hospitals-list">
              <div className="sp-list-header">
                <span className="sp-list-col-rank">الأولوية</span>
                <span className="sp-list-col-name">المستشفى</span>
                {registrationStatus === 'open' && (
                  <span className="sp-list-col-actions">تغيير الترتيب</span>
                )}
              </div>

              {ranked.map((h, index) => (
                <div key={h.opportunityID} className={`sp-hospital-row ${index === 0 ? 'rank-first' : ''}`}>
                  <div className="sp-rank-badge">
                    <span className="sp-rank-num">{index + 1}</span>
                    {index === 0 && <span className="sp-rank-star">★</span>}
                  </div>

                  <div className="sp-hospital-name">
                    <span className="sp-hospital-icon">🏥</span>
                    <span>{h.hospitalName}</span>
                  </div>

                  {registrationStatus === 'open' && (
                    <div className="sp-move-buttons">
                      <button
                        className="sp-move-btn"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        title="تحريك للأعلى"
                      >
                        ▲
                      </button>
                      <button
                        className="sp-move-btn"
                        onClick={() => moveDown(index)}
                        disabled={index === ranked.length - 1}
                        title="تحريك للأسفل"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {registrationStatus === 'open' && ranked.length > 0 && (
            <div className="sp-save-footer">
              <p className="sp-save-hint">بعد ضبط الترتيب اضغط حفظ لتأكيد رغباتك</p>
              <button className="sp-save-btn sp-save-btn-lg" onClick={handleSave} disabled={saving}>
                {saving ? 'جاري الحفظ...' : hasSaved ? 'تعديل الرغبات' : 'حفظ الترتيب'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentPreferencesPage;
