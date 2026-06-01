import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/reports.css";
import "../../styles/search.css";
import { FaSearch, FaFileAlt, FaPlus } from "react-icons/fa";

export default function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // جلب التقارير المنشورة
  const fetchPublishedReports = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/supervisor/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
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

  // تشغيل جلب التقارير مرة واحدة
  useEffect(() => {
    fetchPublishedReports();
  }, []);

  // فلترة التقارير داخل الصفحة حسب اسم التقرير أو الفترة
  const filteredReports = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return reports;

    return reports.filter((report) => {
      const title = report.reportTitle || "";
      const periodName = report.periodName || "";

      return (
        title.toLowerCase().includes(searchValue) ||
        periodName.toLowerCase().includes(searchValue)
      );
    });
  }, [reports, search]);

  // دوال مساعدة
  const getReportStatusText = (status) => {
    if (status === "PUBLISHED") return "نشط";
    if (status === "CLOSED") return "مغلق";
    return "غير محدد";
  };

  const getReportStatusClass = (status) => {
    if (status === "PUBLISHED") return "submitted";
    if (status === "CLOSED") return "completed";
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

  const getPeriodText = (report) => {
    const periodName = report.periodName || "فترة غير محددة";
    const periodLevel = report.periodLevel ? ` - ${report.periodLevel}` : "";

    return `${periodName}${periodLevel}`;
  };

  const getStudentsText = (report) => {
    const totalStudents = Number(report.totalStudents || 0);
    const submittedStudents = Number(report.submittedStudents || 0);

    return `${submittedStudents} / ${totalStudents} سلموا`;
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
              <h1>التقارير</h1>
              <p>إدارة التقارير المنشورة ومتابعة تسليم الطلاب</p>
            </div>
          </div>
        </div>

        <div className="create-report-wrapper">
          <button
            className="create-report-btn"
            onClick={() => navigate("/reports/create")}
          >
            <span className="btn-icon">
              <FaPlus />
            </span>
            إنشاء تقرير
          </button>
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
            placeholder="ابحث باسم التقرير أو الفترة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FaSearch className="icon" />
        </div>
      </div>

      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>التقارير المنشورة</h2>
        </div>

        {loading ? (
          <div className="empty-reports">جاري تحميل التقارير...</div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-reports">
            <h3>لا توجد تقارير</h3>
            <p>لم يتم العثور على تقارير منشورة.</p>
          </div>
        ) : (
          <div className="reports-table">
            <div className="table-head">
              <span>اسم التقرير</span>
              <span>الفترة المرتبطة</span>
              <span>عدد الطلاب</span>
              <span>حالة التقرير</span>
              <span>الإجراء</span>
            </div>

            {filteredReports.map((report) => (
              <div className="table-row" key={report.reportID}>
                <div className="report-title-cell">
                  <span className="row-file-icon">
                    <FaFileAlt />
                  </span>

                  <span>{report.reportTitle || "بدون عنوان"}</span>

                  <small className="date-cell">
                    تاريخ النشر: {formatDate(report.publishedAt)}
                  </small>
                </div>

                <span>{getPeriodText(report)}</span>

                <span>{getStudentsText(report)}</span>

                <span
                  className={`status-badge ${getReportStatusClass(
                    report.reportStatus
                  )}`}
                >
                  {getReportStatusText(report.reportStatus)}
                </span>

                <button
                  className="view-report-btn"
                  onClick={() =>
                    navigate(`/reports/${report.reportID}/students`)
                  }
                >
                  عرض
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}