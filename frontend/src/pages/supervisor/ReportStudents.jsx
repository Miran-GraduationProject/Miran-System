import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "../../styles/reports.css";
import "../../styles/search.css";



export default function ReportStudents() {
  const { reportID } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [reportTitle, setReportTitle] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReportStudents();
  }, [reportID]);

  const fetchReportStudents = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/supervisor/report/${reportID}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching report students:", data);
        setStudents([]);
        return;
      }

      const list = Array.isArray(data.students) ? data.students : [];
      setStudents(list);

      if (list.length > 0) {
        setReportTitle(list[0].reportTitle || "");
      }
    } catch (error) {
      console.error("Error fetching report students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fullName = `${student.firstName || ""} ${student.secondName || ""} ${
        student.lastName || ""
      }`;

      return (
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        String(student.studentID || "").includes(search)
      );
    });
  }, [students, search]);

  const stats = useMemo(() => {
    const totalStudents = students.length;

    const submittedStudents = students.filter(
      (student) => student.submissionStatus === "SUBMITTED"
    ).length;

    const notSubmittedStudents = students.filter(
      (student) => student.submissionStatus === "NOT_SUBMITTED"
    ).length;

    const approvedStudents = students.filter(
      (student) => student.approvalStatus === "APPROVED"
    ).length;

    return {
      totalStudents,
      submittedStudents,
      notSubmittedStudents,
      approvedStudents,
    };
  }, [students]);

  const getStudentName = (student) => {
    return `${student.firstName || ""} ${student.secondName || ""} ${
      student.lastName || ""
    }`.trim();
  };

  const getSubmissionText = (student) => {
    if (student.submissionStatus === "SUBMITTED") return "تم التسليم";
    return "لم يسلّم";
  };

  const getSubmissionClass = (student) => {
    if (student.submissionStatus === "SUBMITTED") return "submitted";
    return "unknown";
  };

  const getApprovalText = (student) => {
    if (student.submissionStatus === "NOT_SUBMITTED") return "لا يوجد تسليم";
    if (student.approvalStatus === "APPROVED") return "تمت الموافقة";
    return "بانتظار الموافقة";
  };

  const getApprovalClass = (student) => {
    if (student.approvalStatus === "APPROVED") return "completed";
    if (student.submissionStatus === "SUBMITTED") return "review";
    return "unknown";
  };

  const formatDate = (date) => {
    if (!date) return "غير محدد";

    try {
      return new Date(date).toLocaleDateString("ar-SA");
    } catch {
      return "غير محدد";
    }
  };
      



  


  return (
    <div className="reports-page">
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon">👥</div>

            <div>
              <h1>طلاب التقرير</h1>
              <p>{reportTitle || `تقرير رقم ${reportID}`}</p>
            </div>
          </div>
        </div>

        <div className="create-report-wrapper">
          <button
            className="create-report-btn"
            type="button"
            onClick={() => navigate("/reports")}
          >
            رجوع للتقارير
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span>إجمالي الطلاب</span>
            <strong>{stats.totalStudents}</strong>
            <p>كل الطلاب المرتبطين بالفترة</p>
          </div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>سلّموا التقرير</span>
            <strong>{stats.submittedStudents}</strong>
            <p>طلاب أرسلوا التقرير</p>
          </div>
          <div className="stat-icon">📥</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>لم يسلّموا</span>
            <strong>{stats.notSubmittedStudents}</strong>
            <p>طلاب لم يرسلوا التقرير</p>
          </div>
          <div className="stat-icon">⏱</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>تمت الموافقة</span>
            <strong>{stats.approvedStudents}</strong>
            <p>تقارير تمت الموافقة عليها</p>
          </div>
          <div className="stat-icon">✓</div>
        </div>
      </div>

      <div className="search-card reports-search-card">
        <div className="results-count">
          عدد النتائج: {filteredStudents.length} طالب
        </div>

        <div className="group">
          <input
            className="input"
            type="text"
            placeholder="ابحث باسم الطالب أو الرقم الجامعي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FaSearch className="icon" />
        </div>
      </div>

      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>قائمة الطلاب</h2>
        </div>

        {loading ? (
          <div className="empty-reports">جاري تحميل الطلاب...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-reports">
            <h3>لا توجد بيانات</h3>
            <p>لم يتم العثور على طلاب لهذا التقرير.</p>
          </div>
        ) : (
          <div className="reports-table">
            <div className="table-head">
              <span>اسم الطالب</span>
              <span>الرقم الجامعي</span>
              <span>حالة التسليم</span>
              <span>موافقة المشرف</span>
              <span>تاريخ التسليم</span>
              <span>الإجراء</span>
            </div>

            {filteredStudents.map((student) => (
              <div className="table-row" key={student.studentID}>
                <div className="student-cell">
                  <span className="student-avatar">
                    {(student.firstName || "؟").charAt(0)}
                  </span>
                  <span>{getStudentName(student) || "غير محدد"}</span>
                </div>

                <span>{student.studentID}</span>

                <span
                  className={`status-badge ${getSubmissionClass(student)}`}
                >
                  {getSubmissionText(student)}
                </span>

                <span
                  className={`status-badge ${getApprovalClass(student)}`}
                >
                  {getApprovalText(student)}
                </span>

                <span className="date-cell">
                  {student.submissionDate
                    ? formatDate(student.submissionDate)
                    : "غير محدد"}
                </span>

                {student.submissionID ? (
                  <button
                    className="view-report-btn"
                    onClick={() =>
                     navigate(`/reports/submission/${student.submissionID}`)

                    }
                  >
                    عرض التقرير
                  </button>
                ) : (
                  <button className="view-report-btn" disabled>
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