// صفحة المشرف الرئيسة

import { useEffect, useState } from 'react'; // يوز ايفيكت لتشغيل كود معين من الباك ايند
import { useNavigate } from 'react-router-dom'; // عشان ينتقل بين الصفحات
import { FaTasks } from 'react-icons/fa';
import '../../styles/page.css';
import '../../styles/search.css'
import '../../styles/studentList.css'
import "../../styles/reports.css";
import "../../styles/student.css";
import { FaSearch, FaUsers , FaFileAlt} from "react-icons/fa";



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
            <div className="page-icon">
              <FaUsers size={28} />
            </div>

            <div>
              <h1>الطلاب تحت الإشراف</h1>
              <p>إدارة ومتابعة الطلاب</p>
            </div>
          </div>

        </div>
      </div>

      {/* كارد إدارة الحالات */}
      <div className="student-cards-grid" style={{ marginBottom: "24px" }}>
        <button
          className="student-main-card"
          onClick={() => navigate("/supervisor/cases")}
        >
          <span className="student-card-arrow">›</span>
          <div className="student-card-content">
            <div className="student-card-icon-wrap">
              <span className="student-card-icon"><FaTasks /></span>
            </div>
            <h4>إدارة الحالات الإلزامية</h4>
            <p>إضافة وتعديل وحذف الحالات</p>
          </div>
        </button>
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
          <h2>قائمة الطلاب</h2>
        </div>

          <div className="reports-table">
            <div
              className="table-head"
              style={{
                display: 'grid',
                  gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.7fr 0.7fr', // أضفنا عمود سادس
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <span>الطالب</span>
              <span>الرقم الجامعي</span>
              <span>الفترة التدريبية</span>
              <span>التقارير</span>
              <span>الإجراء</span>
              <span>Log book</span>
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
                        gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.7fr 0.7fr',
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
                        <span className="row-file-icon">
                          <FaFileAlt />
                        </span>
                        <span>{s.reports ?? 0}</span>
                      </div>

                      <button
                        className="view-report-btn"
                        onClick={() => navigate(`/supervisor/student/${s.studentID}`)}
                      >
                        عرض
                      </button>


                       <div className="logbook-cell">
                      <button
                       className="download-btn"
                       onClick={async () => {
                        try {
                           const res = await fetch(
                                    (`http://localhost:3000/api/logbook/${s.studentID}`)

                            );
                         if (!res.ok) throw new Error("Download failed");
                         const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, "_blank");
                          } catch (error) {
                             navigate("/error-download");
                          }
                        }
                       }
                         >
                           تحميل PDF
                      </button>
                      </div>
                      
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