// صفحة خاصة بالمشرف، لعرض تفاصيل احد الطلاب

import { Component, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/Button.css';
import '../../styles/page.css';
import '../../styles/BackButton.css'
import '../../styles/reports.css';
import { styled } from "styled-components";
import { FaArrowRight } from "react-icons/fa";


function StudentDetails() {
    
    const { studentID } = useParams(); // خذ رقم الطالب
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/api/supervisor/students/search/${studentID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Error:", data.message);
          setStudent(null);
        } else {
          setStudent(data); // يرجع طالب واحد
        }

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentID]);

  if (loading) return <p>جاري تحميل...</p>;
  if (!student) return <p>لم يتم العثور...</p>;

  return (
    <div className="reports-page">

      <button className="view-report-btn" onClick={() => navigate(`/supervisor`)}>
          <FaArrowRight />
          العودة إلى قائمة الطلاب
      </button>

      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon">📊</div>

            <div>
              <h1>تفاصيل الطالب</h1>
              <p>عرض معلومات الطالب وتقاريره</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-content">
            <span>الاسم</span>
            <strong style={{ fontSize: "16px" }}>{student.firstName} {student.middleName} {student.lastName}</strong>
          </div>
          <div className="stat-icon">👤</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>الرقم الجامعي</span>
            <strong style={{ fontSize: "16px" }}>{student.studentID}</strong>
          </div>
          <div className="stat-icon">🪪</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>البريد الجامعي</span>
            <strong style={{ fontSize: "16px" }}>{student.email}</strong>
          </div>
          <div className="stat-icon">✉️</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>المستوى الدراسي</span>
            <strong style={{ fontSize: "16px" }}>{student.level}</strong>
          </div>
          <div className="stat-icon">⏸️</div>
        </div>

        {student.periodName && (
          <div className="stat-card">
            <div className="stat-content">
              <span>الفترة التدريبية</span>
              <strong style={{ fontSize: "16px" }}>{student.periodName}</strong>
            </div>
            <div className="stat-icon">✔️</div>
          </div>
        )}

        {student.reports !== undefined && (
          <div className="stat-card">
            <div className="stat-content">
              <span>عدد التقارير</span>
              <strong style={{ fontSize: "16px" }}>{student.reports}</strong>
            </div>
            <div className="stat-icon">📄</div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-content">
            <span>المستشفى</span>
            <strong style={{ fontSize: "16px" }}>{student.hospitalName}</strong>
          </div>
          <div className="stat-icon">🏥</div>
        </div>
      </div>
    </div>
  );
}
export default StudentDetails;