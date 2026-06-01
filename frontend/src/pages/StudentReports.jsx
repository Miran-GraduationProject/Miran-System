import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/reports.css";
import "../styles/search.css";
import {
  FaSearch,
  FaFileAlt,
  FaCheck,
  FaCircle,
  FaClock,
  FaExclamation,
} from "react-icons/fa";

export default function StudentReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentReports();
  }, []);

  const fetchStudentReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/student/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching reports:", data);
        setReports([]);
        return;
      }

      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const isExpiredNotSubmitted = (report) => {
    return report.studentReportState === "EXPIRED_NOT_SUBMITTED";
  };

  const getReviewState = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "accept" || value === "accepted") return "accepted";
    if (value === "reject" || value === "rejected") return "rejected";
    if (value === "needs revision") return "needs revision";
    return "pending";
  };

  const getStatusText = (report) => {
    if (isExpiredNotSubmitted(report)) {
      return "انتهت الفترة ولم يتم التسليم";
    }

    if (!report.submissionID) {
      return "لم يتم التسليم";
    }

    return getReviewState(report.approvalStatus);
  };

  const getStatusClass = (report) => {
    if (isExpiredNotSubmitted(report)) {
      return "expired";
    }

    if (!report.submissionID) {
      return "unknown";
    }

    const reviewState = getReviewState(report.approvalStatus);

    if (reviewState === "accepted") {
      return "completed";
    }

    if (reviewState === "rejected") {
      return "expired";
    }

    if (reviewState === "needs revision") {
      return "review";
    }

    return "submitted";
  };

  const renderStatusIcon = (report) => {
    if (isExpiredNotSubmitted(report)) {
      return <FaExclamation />;
    }

    return <FaCheck />;
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const title = report.reportTitle || "";
      const periodName = report.periodName || "";
      const statusText = getStatusText(report);

      return (
        title.toLowerCase().includes(search.toLowerCase()) ||
        periodName.toLowerCase().includes(search.toLowerCase()) ||
        statusText.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [reports, search]);

  const stats = useMemo(() => {
    const totalReports = reports.length;

    const submittedCount = reports.filter(
      (report) => report.submissionID
    ).length;

    const approvedCount = reports.filter(
      (report) => getReviewState(report.approvalStatus) === "accepted"
    ).length;

    const expiredNotSubmittedCount = reports.filter((report) =>
      isExpiredNotSubmitted(report)
    ).length;

    const notSubmittedCount = reports.filter(
      (report) => !report.submissionID
    ).length;

    return {
      totalReports,
      submittedCount,
      approvedCount,
      notSubmittedCount,
      expiredNotSubmittedCount,
    };
  }, [reports]);

  const formatDate = (date) => {
    if (!date) return "غير محدد";

    try {
      return new Date(date).toLocaleDateString("ar-SA");
    } catch {
      return "غير محدد";
    }
  };

  const handleOpenReport = (report) => {
    navigate(`/student/reports/fill/${report.reportID}`);
  };

  const getActionText = (report) => {
    if (isExpiredNotSubmitted(report)) {
      return "عرض";
    }

    if (report.submissionID) {
      return "عرض التقرير";
    }

    return "تعبئة التقرير";
  };

  return (
    <div className="reports-page">
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon">
              <FaFileAlt />
            </div>

            <div>
              <h1>تقاريري</h1>
              <p>التقارير المطلوبة منك خلال فترة التدريب</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span>إجمالي التقارير</span>
            <strong>{stats.totalReports || 0}</strong>
            <p>كل التقارير المرتبطة بك</p>
          </div>

          <div className="stat-icon">
            <FaFileAlt />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>تم التسليم</span>
            <strong>{stats.submittedCount || 0}</strong>
            <p>تقارير تم إرسالها</p>
          </div>

          <div className="stat-icon">
            <FaCheck />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>تمت الموافقة</span>
            <strong>{stats.approvedCount || 0}</strong>
            <p>تقارير وافق عليها المشرف</p>
          </div>

          <div className="stat-icon">
            <FaCircle />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>لم يتم التسليم</span>
            <strong>{stats.notSubmittedCount || 0}</strong>
            <p>منها {stats.expiredNotSubmittedCount || 0} انتهت فترتها</p>
          </div>

          <div className="stat-icon">
            <FaClock />
          </div>
        </div>
      </div>

      <div className="search-card reports-search-card">
        <div className="results-count">
          عدد النتائج: {filteredReports.length} تقرير
        </div>

        <div className="group">
          <input
            className="input"
            type="text"
            placeholder="ابحث باسم التقرير أو الفترة أو الحالة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FaSearch className="icon" />
        </div>
      </div>

      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>قائمة التقارير</h2>
        </div>

        {loading ? (
          <div className="empty-reports">جاري تحميل التقارير...</div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-reports">
            <h3>لا توجد تقارير</h3>
            <p>لا توجد تقارير مرتبطة بحسابك حاليًا.</p>
          </div>
        ) : (
          <div className="reports-table">
            <div className="table-head">
              <span>عنوان التقرير</span>
              <span>الفترة التدريبية</span>
              <span>تاريخ التسليم</span>
              <span>الحالة</span>
              <span>الإجراء</span>
            </div>

            {filteredReports.map((report) => (
              <div className="table-row" key={report.reportID}>
                <div className="report-title-cell">
                  <span className="row-file-icon">
                    <FaFileAlt />
                  </span>

                  <div>
                    <span>{report.reportTitle || "بدون عنوان"}</span>

                    <small className="date-cell">
                      تاريخ النشر: {formatDate(report.publishedAt)}
                    </small>
                  </div>
                </div>

                <span>
                  {report.periodName || "غير محددة"}
                  {report.periodLevel ? ` - ${report.periodLevel}` : ""}
                </span>

                <span>{formatDate(report.submissionDate)}</span>

                <span className={`status-badge ${getStatusClass(report)}`}>
                  {getStatusText(report)}

                  <span className="status-check">
                    {renderStatusIcon(report)}
                  </span>
                </span>

                <button
                  className="view-report-btn"
                  onClick={() => handleOpenReport(report)}
                >
                  {getActionText(report)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
