//  بصفحة المنسق فيه خانة اسمها  متابعة حالة التسجيل هذي هي
// شغلتها ان فيها قائمة تختار منها الفترات الي تبغا تشوف معلومات التسجيل يعني بالمختصر تخلي المنسق يشوف احصائيات من سجل ومين باقي ماسجل
// فيها  كذا شريط  العدد الاجمالي يوضح عدد الطلاب الكلي والطالبات ونسبة كل واحد فيهم  بالتفصيل
//وتحت ذي البطاقتين كل المستشفيات وكم مقعد فيها وبرضوا فيها نسب الطلاب لكن الفرق هنا ان كل بطاة تعرض نسبة المستشفى الخاص فيها



// الاستيت نستخدمه علشان نخزن بيانات داخل الصفحة والافكت علشان نشغل شي تلقائي لما الصفحة تفتح او لما قيمة تتغير
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/registrationMonitor.css';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/coordinator/training-period',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const pct = (val, total) => total > 0 ? Math.min(Math.round((val / total) * 100), 100) : 0;

function RegistrationMonitorPage() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodID, setSelectedPeriodID] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/all-periods');
      const list = res.data.periods || [];
      setPeriods(list);
      if (list.length > 0) {
        setSelectedPeriodID(list[0].periodID);
        fetchStats(list[0].periodID);
      }
    } catch {
      setError('تعذر تحميل الفترات التدريبية');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (periodID) => {
    try {
      setStatsLoading(true);
      setError('');
      const res = await api.get(`/registration-stats?periodID=${periodID}`);
      setStats(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setStats(null);
        setError('لا توجد بيانات لهذه الفترة');
      } else {
        setError('تعذر تحميل البيانات');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getRegStatus = (period) => {
    if (!period) return { label: '', cls: '' };
    const now = new Date();
    if (period.status === 'ALLOCATED') return { label: 'تم التوزيع', cls: 'badge-allocated' };
    if (now < new Date(period.registrationOpen)) return { label: 'لم يبدأ التسجيل', cls: 'badge-closed' };
    if (now <= new Date(period.registrationClose)) return { label: 'التسجيل مفتوح', cls: 'badge-open' };
    return { label: 'التسجيل مغلق', cls: 'badge-closed' };
  };

  const getStatusBanner = (malePercent, femalePercent) => {
    const avg = (malePercent + femalePercent) / 2;
    if (avg >= 100) return { label: 'إقبال عالٍ جداً 📈', cls: 'banner-full' };
    if (avg >= 75) return { label: 'إقبال عالٍ ⚡', cls: 'banner-near' };
    return null;
  };

  const totalRegistered    = stats?.totalRegistered       ?? 0;
  const totalMaleReg       = stats?.totalMaleRegistered   ?? 0;
  const totalFemaleReg     = stats?.totalFemaleRegistered ?? 0;
  const totalMaleCap       = stats ? stats.hospitals.reduce((s, h) => s + h.maleCapacity, 0) : 0;
  const totalFemaleCap     = stats ? stats.hospitals.reduce((s, h) => s + h.femaleCapacity, 0) : 0;
  const totalCap           = totalMaleCap + totalFemaleCap;

  const regStatus = stats ? getRegStatus(stats.period) : null;

  return (
    <div className="monitor-page" dir="rtl">
      <div className="monitor-header">
        <div>
          <h1>متابعة حالة التسجيل</h1>
          <p>إحصائيات تسجيل الطلاب في الفترات التدريبية</p>
        </div>
        <button className="monitor-refresh-btn" onClick={() => selectedPeriodID && fetchStats(selectedPeriodID)}>
          تحديث
        </button>
      </div>

      {loading ? (
        <p className="monitor-loading">جاري التحميل...</p>
      ) : periods.length === 0 ? (
        <p className="monitor-error">لا توجد فترات تدريبية حالياً</p>
      ) : (
        <>
          <div className="monitor-period-selector">
            <label>الفترة التدريبية:</label>
            <select
              value={selectedPeriodID || ''}
              onChange={e => {
                const id = Number(e.target.value);
                setSelectedPeriodID(id);
                fetchStats(id);
              }}
              className="monitor-select"
            >
              {periods.map(p => (
                <option key={p.periodID} value={p.periodID}>
                  {p.name} — {p.level}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="monitor-error">{error}</p>}

          {statsLoading ? (
            <p className="monitor-loading">جاري تحميل الإحصائيات...</p>
          ) : stats ? (
            <>
              <div className="monitor-summary">
                <div className="summary-card summary-card-full">

                  <div className="summary-row">
                    <span className="summary-row-label">🎓 الإجمالي</span>
                    <span className="summary-row-count">{totalRegistered}/{totalCap}</span>
                    <span className="summary-row-percent">{pct(totalRegistered, totalCap)}%</span>
                  </div>
                  <div className="summary-bar-bg">
                    <div className="summary-bar-fill bar-total" style={{ width: `${pct(totalRegistered, totalCap)}%` }}></div>
                  </div>

                  <div className="summary-row">
                    <span className="summary-row-label">👩‍🎓 الطالبات</span>
                    <span className="summary-row-count">{totalFemaleReg}/{totalFemaleCap}</span>
                    <span className="summary-row-percent">{pct(totalFemaleReg, totalFemaleCap)}%</span>
                  </div>
                  <div className="summary-bar-bg">
                    <div className="summary-bar-fill bar-female" style={{ width: `${pct(totalFemaleReg, totalFemaleCap)}%` }}></div>
                  </div>

                  <div className="summary-row">
                    <span className="summary-row-label">👨‍🎓 الطلاب</span>
                    <span className="summary-row-count">{totalMaleReg}/{totalMaleCap}</span>
                    <span className="summary-row-percent">{pct(totalMaleReg, totalMaleCap)}%</span>
                  </div>
                  <div className="summary-bar-bg">
                    <div className="summary-bar-fill bar-male" style={{ width: `${pct(totalMaleReg, totalMaleCap)}%` }}></div>
                  </div>

                </div>
              </div>

              <div className="hospital-cards-grid">
                {stats.hospitals.length === 0 ? (
                  <p className="monitor-empty">لا توجد مستشفيات في هذه الفترة</p>
                ) : stats.hospitals.map((h, i) => {
                  const malePercent   = pct(h.maleRegistered, h.maleCapacity);
                  const femalePercent = pct(h.femaleRegistered, h.femaleCapacity);
                  const banner = getStatusBanner(malePercent, femalePercent);
                  const isOpen = regStatus?.cls === 'badge-open';

                  return (
                    <div className="hospital-card" key={i}>
                      <div className={`hospital-card-header ${isOpen ? 'header-open' : 'header-closed'}`}>
                        <div className="hospital-card-header-info">
                          <span className="hospital-card-name">{h.hospitalName}</span>
                          <span className="hospital-card-period">{stats.period.name}</span>
                        </div>
                        <span className={`status-badge ${regStatus?.cls}`}>
                          {regStatus?.label}
                        </span>
                      </div>

                      <div className="hospital-card-body">
                        <div className="hospital-deadline">
                          <span className="deadline-icon">📅</span>
                          <span>آخر موعد للتسجيل: {formatDate(stats.period.registrationClose)}</span>
                        </div>

                        <div className="hospital-gender-row">
                          <div className="gender-label-row">
                            <span className="gender-label">الطلاب</span>
                            <span className="gender-count">{h.maleRegistered}/{h.maleCapacity}</span>
                            <span className="gender-percent">{malePercent}%</span>
                          </div>
                          <div className="gender-bar-bg">
                            <div className="gender-bar-fill male-fill" style={{ width: `${malePercent}%` }}></div>
                          </div>
                        </div>

                        <div className="hospital-gender-row">
                          <div className="gender-label-row">
                            <span className="gender-label">الطالبات</span>
                            <span className="gender-count">{h.femaleRegistered}/{h.femaleCapacity}</span>
                            <span className="gender-percent">{femalePercent}%</span>
                          </div>
                          <div className="gender-bar-bg">
                            <div className="gender-bar-fill female-fill" style={{ width: `${femalePercent}%` }}></div>
                          </div>
                        </div>

                        {banner && (
                          <div className={`status-banner ${banner.cls}`}>{banner.label}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

export default RegistrationMonitorPage;