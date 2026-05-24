// صفحة الطالبة الرئيسية
// الي ماسكتها بعدي تزبطها


import { useNavigate } from 'react-router-dom';
import '../styles/student.css';

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="student-container">
      <header className="student-page-header">
        <h1>لوحة التحكم</h1>
        <p>مرحباً بك في بوابة التدريب التعاوني لجامعة أم القرى</p>
      </header>

      <section className="student-sections-title">
        <h3>الأقسام الرئيسية</h3>
      </section>

      <div className="student-cards-grid">
        <button
          className="student-main-card"
          onClick={() => navigate('/student-preferences')}
        >
          <span className="student-card-arrow">›</span>
          <div className="student-card-content">
            <div className="student-card-icon-wrap">
              <span className="student-card-icon">📋</span>
            </div>
            <h4>فرص التدريب</h4>
            <p>ترتيب ومتابعة رغبات التدريب</p>
          </div>
        </button>

        {/* كارد التقارير */}
        <button
          className="student-main-card"
          onClick={() => navigate("/student/reports")}
        >
          <span className="student-card-arrow">›</span>

          <div className="student-card-content">
            <div className="student-card-icon-wrap">
              <span className="student-card-icon">📄</span>
            </div>

            <h4>التقارير</h4>
            <p>عرض وتعبئة تقارير التدريب</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;
      