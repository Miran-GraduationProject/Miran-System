// صفحة المشرف الرئيسة

import { useEffect, useState } from 'react'; // يوز ايفيكت لتشغيل كود معين من الباك ايند
import { useNavigate } from 'react-router-dom'; // عشان ينتقل بين الصفحات
import '../../styles/Buttons.css';
import '../../styles/page.css';
import '../../styles/search.css'
import '../../styles/studentList.css'
import "../../styles/reports.css";
import { FaSearch } from "react-icons/fa";

function SupervisorDashboard() {

  const navigate = useNavigate(); // علشان لما اضغط على خانة ينقلني لصفحتها

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);


    // دالة تجيب الأحرف الأولى من اسم الطالب
  const getStudentInitials = (s) => {
    const f = s.firstName?.[0] || "";
    const l = s.lastName?.[0] || "";
    return (f + l).trim() || "؟";
  };

  // عرض الطلاب
  useEffect(() => { // يشغل الكود مره وحدة اول ما تحمل الصفحة فقط
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    fetch("http://localhost:3000/api/supervisor/students", { headers })
      .then(r => r.json())
      .then(data => setStudents(data.students || []));
  }, []);

// دالة البحث تشتغل اول ما يكتب
  const handleSearch = async (value) => {
    setSearch(value);
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    // اذا البحث فاضي يرجع الكل
    if (value.trim() === "") {
      const res = await fetch("http://localhost:3000/api/supervisor/students", { headers });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : data.students || []);
      return;
  }
  const res = await fetch(
    `http://localhost:3000/api/supervisor/students/search?name=${value}`,
    { headers }
  );


    const data = await res.json();
    setStudents(data.results || []);
  };

// ----------------------------------------------------
  // ----------------------------------------------------
  return (
    <div className="reports-page">
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon">🏠</div>

            <div>
              <h1>لوحة التحكم الرئيسية</h1>
              <p>إدارة التقارير ومتابعة الطلاب </p>
            </div>
          </div>
        </div>
      </div>

      <div className="search-card reports-search-card">
        <div className="results-count">
          عدد النتائج: {students.length}
        </div>

        <div className="group">
          <input
            className="input"
            type="text"
            placeholder="ابحث بإسم الطالب..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

           <FaSearch className="icon" />
        </div>
      </div>

      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>الطلاب تحت الاشراف</h2>
        </div>

          <div className="reports-table">
            <div
              className="table-head"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.7fr',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <span>الطالب</span>
              <span>الرقم الجامعي</span>
              <span>الفترة التدريبية</span>
              <span>التقارير</span>
              <span>الإجراء</span>
            </div>

            <div className="table-body">
              {students.length === 0 ? (
                <div className="table-row">
                  <span className="sl-empty">لا يوجد طلاب</span>
                </div>
              ) : (
                students.map((s) => {
                  const studentName = `${s.firstName || ""} ${s.lastName || ""}`.trim();

                  return (
                    <div
                      className="table-row"
                      key={s.studentID}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.7fr',
                        gap: '16px',
                        alignItems: 'center',
                      }}
                    >
                      <div className="student-cell">
                        <span className="student-avatar">
                          {getStudentInitials(s)}
                        </span>
                        <span>{studentName || "غير محدد"}</span>
                      </div>

                      <span>{s.studentID}</span>

                      <span>{s.periodName || "غير محددة"}</span>

                      <div className="report-title-cell">
                        <span className="row-file-icon">📄</span>
                        <span>{s.reports ?? 0}</span>
                      </div>

                      <button
                        className="view-report-btn"
                        onClick={() => navigate(`/supervisor/student/${s.studentID}`)}
                      >
                        عرض
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;