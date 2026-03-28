// صفحة المنسق الرئيسة
// بالصفحات ما اكذب عليكم بنات مالقيت واجهات جاهزة با اضطريت اني اسويها من الصفر مع شات
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/coordinator.css';

function CoordinatorDashboard() {

  const navigate = useNavigate(); // علشان لما اضغط على خانة ينقلني لصفحتها
  const [stats, setStats] = useState({ // ذا فكيتو الصفحة الرئيسية بتلاقو بطايق خضراء زي الاحصائيات وكذا 
    openPeriods: 0,
    allocatedPeriods: 0,
    hospitals: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([ // يجيب بيانات البطايق كلهم سوا 
      fetch('/api/periods/all-periods', { headers }).then(r => r.json()),
      fetch('/api/periods/allocated-periods', { headers }).then(r => r.json()),
      fetch('/api/hospitals', { headers }).then(r => r.json()),
    ]).then(([periodsData, allocatedData, hospitalsData]) => {
      setStats({
        openPeriods: periodsData.periods?.length ?? 0,
        allocatedPeriods: allocatedData.periods?.length ?? 0,
        hospitals: hospitalsData.hospitals?.length ?? 0,
      });
    });
  }, []);
// خلاص هنا بداية تنسيق الصفحة 
  return (
    <div className="coord-container">
      <main className="main-content">
        
        {/* المربع الكبير العلوي - لوحة التحكم */}
        <header className="page-header">
          <h1>لوحة التحكم الرئيسية</h1>
          <p>إدارة شؤون التدريب التعاوني لجامعة أم القرى</p>
        </header>

        {/* قسم البطاقات الثلاث (الإحصائيات) */}
        <section className="stats-section">
          {/* البطاقة 1 */}
          <div className="stat-card">
            <div className="card-info">
              <span className="card-title">المستشفيات المتاحة</span>
              <span className="card-number">{stats.hospitals}</span>
            </div>
            <div className="card-icon icon-blue"></div>
          </div>

          {/* البطاقة 2 */}
          <div className="stat-card">
            <div className="card-info">
              <span className="card-title">فرص تدريب مؤكدة</span>
              <span className="card-number">{stats.allocatedPeriods}</span>
            </div>
            <div className="card-icon icon-purple"></div>
          </div>

          {/* البطاقة 3 الخضراء (فترات التدريب النشطة) */}
          <div className="stat-card active-period-card">
            <div className="card-info">
              <span className="card-title">فترات التدريب النشطة</span>
              <span className="card-number">{stats.openPeriods}</span>
            </div>
            <div className="card-icon icon-white"></div>
          </div>
        </section>

        {/* قسم الإجراءات السريعة (الأزرار بالأسفل) */}
        <section className="actions-section">
          <h3>الإجراءات السريعة</h3>
          
          <div className="actions-grid">
            <button className="action-item" onClick={() => navigate('/hospitals')}>
               <span className="badge-count count-green"></span>
               <p>  إدارة المستشفيات</p>
               <span className="action-icon"></span>
            </button>

            <button className="action-item" onClick={() => navigate('/training-periods')}>
               <span className="badge-count count-blue"></span>
               <p>إدارة فترات التدريب</p>
               <span className="action-icon"></span>
            </button>

            <button className="action-item" onClick={() => navigate('/registration-monitor')}>
               <p>متابعة حالة التسجيل</p>
               <span className="action-icon"></span>
            </button>

            <button className="action-item" onClick={() => navigate('/student-list')}>
               <p>إدارة قوائم الطلاب</p>
               <span className="action-icon"></span>
            </button>

            <button className="action-item" onClick={() => navigate('/confirmed-allocations')}>
               <p>فرص التدريب المؤكدة</p>
               <span className="action-icon"></span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default CoordinatorDashboard;