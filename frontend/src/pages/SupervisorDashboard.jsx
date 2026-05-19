// صفحة المشرف الرئيسة

import { useEffect, useState } from 'react'; // يوز ايفيكت لتشغيل كود معين من الباك ايند
import { useNavigate } from 'react-router-dom'; // عشان ينتقل بين الصفحات
import '../styles/Button.css';
import '../styles/page.css';
import '../styles/search.css'
import '../styles/studentList.css'
import { FaSearch } from "react-icons/fa";



function SupervisorDashboard() {

  const navigate = useNavigate(); // علشان لما اضغط على خانة ينقلني لصفحتها

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);

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
  return (
    <div className="container"> 
      <main className="main-content">
        {/* تحميل كلاس التنسيق من ملف css >>> main يعني محتوى الصفحة */}
        
        <header className="page-header">
          <h1>لوحة التحكم الرئيسية</h1>
          <p>إدارة ومتابعة الطلاب والتقارير </p>
        </header>

        <div className="search-card">

          <p className="results-count">
            عدد النتائج: {students.length} طلاب
          </p>

          <div className="group">
  <FaSearch className="search-icon" />

  <input
    type="text"
    className="input"
    placeholder="البحث بإسم الطالب..."
    value={search}
    onChange={(e) => handleSearch(e.target.value)}
  />
</div>

        </div>
      </main>
<div className="sl-table-box">
  <table className="sl-table">
    <thead>
      <tr>
        <th>الطالب</th>
        <th>الرقم الجامعي</th>
        <th>الفترة التدريبية</th>
        <th>التقارير</th>
        <th>الاجراءات</th>
      </tr>
    </thead>

    <tbody>
      {students.length === 0 ? (
        <tr>
          <td colSpan="5" className="sl-empty">لا يوجد طلاب</td>
        </tr>
      ) : (
        students.map((s) => (
          <tr key={s.studentID}>
            <td>{s.firstName} {s.lastName}</td>
            <td>{s.studentID}</td>
            <td>{s.periodName}</td>
            <td>{s.reports || 0}</td>
            <td>
              <button
                className="button"
                onClick={() => navigate(`/supervisor/student/${s.studentID}`)}
              >
                <span className="label">عرض</span>
                <span className="gradient"></span>
                <span className="transition"></span>
              </button>

            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
    </div>
  );
}

export default SupervisorDashboard;