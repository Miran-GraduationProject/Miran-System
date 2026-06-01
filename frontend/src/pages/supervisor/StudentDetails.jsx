// صفحة خاصة بالمشرف، لعرض تفاصيل احد الطلاب

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/Button.css';
import '../../styles/page.css';
import '../../styles/BackButton.css';
import '../../styles/reports.css';
import { styled } from "styled-components";
import { FaArrowRight } from "react-icons/fa";


function StudentDetails() {
    
    const { studentID } = useParams(); // خذ رقم الطالب
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentReports, setStudentReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(true);

    useEffect(() => {
      const fetchStudent = async () => {
        const token = localStorage.getItem('token');

        try {
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
            console.error('Error:', data.message);
            setStudent(null);
            setStudentReports([]);
          } else {
            setStudent(data); // يرجع طالب واحد
            await fetchStudentReports(data.studentID, token);
          }
        } catch (err) {
          console.error('Fetch error:', err);
          setStudent(null);
          setStudentReports([]);
        } finally {
          setLoading(false);
          setReportsLoading(false);
        }
      };

      const fetchStudentReports = async (studentID, token) => {
        try {
          const reportsRes = await fetch('http://localhost:3000/api/supervisor/reports', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const reportsData = await reportsRes.json();
          const reports = Array.isArray(reportsData.reports) ? reportsData.reports : [];

          const reportEntries = await Promise.all(
            reports.map(async (report) => {
              try {
                const studentsRes = await fetch(
                  `http://localhost:3000/api/supervisor/report/${report.reportID}/students`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                const studentsData = await studentsRes.json();
                const studentsList = Array.isArray(studentsData.students)
                  ? studentsData.students
                  : [];

                const studentItem = studentsList.find(
                  (s) => String(s.studentID) === String(studentID)
                );

                if (!studentItem) return null;

                return {
                  reportID: report.reportID,
                  reportTitle: report.reportTitle,
                  reportStatus: report.reportStatus,
                  submissionStatus: studentItem.submissionStatus,
                  approvalStatus: studentItem.approvalStatus,
                  submissionDate: studentItem.submissionDate,
                  submissionID: studentItem.submissionID,
                };
              } catch (err) {
                console.error('Error fetching report students:', err);
                return null;
              }
            })
          );

          setStudentReports(reportEntries.filter(Boolean));
        } catch (err) {
          console.error('Error fetching reports:', err);
          setStudentReports([]);
        }
      };

      fetchStudent();
    }, [studentID]);

    const formatDate = (dateString) => {
      if (!dateString) return 'غير محدد';

      try {
        return new Date(dateString).toLocaleDateString('ar-SA');
      } catch {
        return dateString;
      }
    };

    const getSubmissionText = (status) => {
      if (status === 'SUBMITTED') return 'تم التسليم';
      if (status === 'NOT_SUBMITTED') return 'لم يسلّم';
      return status || 'غير معروف';
    };

    const getApprovalText = (status) => {
      if (status === 'APPROVED') return 'تمت الموافقة';
      if (status === 'PENDING') return 'بانتظار الموافقة';
      return status || 'غير معروف';
    };

    const getBadgeClass = (status) => {
      if (status === 'SUBMITTED' || status === 'APPROVED') return 'submitted';
      if (status === 'PENDING') return 'review';
      return 'unknown';
    };

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

      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>التقارير المرتبطة بالطالب</h2>
        </div>

        <div style={{ margin: '16px 0' }}>
          <button
            className="view-report-btn"
            type="button"
            onClick={() => window.open(`http://localhost:3000/api/logbook/${student.studentID}`, '_blank')}
          >
            تحميل Log book PDF
          </button>
        </div>

        {reportsLoading ? (
          <div className="empty-reports">جاري تحميل تقارير الطالب...</div>
        ) : studentReports.length === 0 ? (
          <div className="empty-reports">
            <h3>لا توجد تقارير مرتبطة بهذا الطالب.</h3>
            <p>لم يتم العثور على أي تقرير لهذا الطالب في تقارير المشرف الحالية.</p>
          </div>
        ) : (
          <div className="reports-table">
            <div className="table-head">
              <span>اسم التقرير</span>
              <span>حالة التسليم</span>
              <span>تاريخ التسليم</span>
              <span>موافقة المشرف</span>
              <span>عرض التقرير</span>
            </div>

            {studentReports.map((report) => (
              <div className="table-row" key={`${report.reportID}-${report.submissionID || 'no'}`}>
                <div className="report-title-cell">
                  <span>{report.reportTitle || 'بدون عنوان'}</span>
                </div>

                <span className={`status-badge ${getBadgeClass(report.submissionStatus)}`}>
                  {getSubmissionText(report.submissionStatus)}
                </span>

                <span className="date-cell">{formatDate(report.submissionDate)}</span>

                <span className={`status-badge ${getBadgeClass(report.approvalStatus)}`}>
                  {getApprovalText(report.approvalStatus)}
                </span>

                {report.submissionID ? (
                  <button
                    className="view-report-btn"
                    type="button"
                    onClick={() => navigate(`/reports/submission/${report.submissionID}`)}
                  >
                    عرض التقرير
                  </button>
                ) : (
                  <button className="view-report-btn" type="button" disabled>
                    لا يوجد تقرير
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default StudentDetails;