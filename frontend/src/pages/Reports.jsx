import { useEffect, useMemo, useState } from "react"; // استتخدمت useMono  عشان البحث يكون في الفرونت اند لين ماتسوي لمى كود البحث عن التقارير 
import { useNavigate } from "react-router-dom"; // الانتقال بين الصفحات
import "../styles/reports.css";
import "../styles/search.css";
import { FaSearch } from "react-icons/fa"; 

export default function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    //القيم المبدئية للاحصائيات 
    totalReports: 0,
    pendingReports: 0,
    reviewReports: 0,
    completedReports: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { // يشغل الكود مره وحدة
    fetchReports();
  }, []);

  // يجيب كل التقارير من الباك اند
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/supervisor/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setStats(data.stats || {});
      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // هذا الكود سويته يتعامل مع useMono لين مانعدل الباك اند ونحذه ونكتب الكود اللي يبحث من الداتا بيس 
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const studentName = `${report.firstName || ""} ${
        report.secondName || ""
      } ${report.lastName || ""}`;

      const title = report.reportTitle || "";

      return (
        title.toLowerCase().includes(search.toLowerCase()) ||
        studentName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [reports, search]);
  //=================================================================================

// مسؤول عن النص اللي يظهر للمستخدم 
  const getStatusText = (status) => {
    if (status === "Submitted") return "تم التسليم";
    if (status === "Under Review") return "قيد المراجعة";
    if (status === "Completed") return "مكتملة";
    return "غير محدد";
  };
 //يربط الحالة بال css
  const getStatusClass = (status) => {
    if (status === "Submitted") return "submitted";
    if (status === "Under Review") return "review";
    if (status === "Completed") return "completed";
    return "unknown";
  };

  const getStudentInitials = (report) => {
    const first = report.firstName ? report.firstName.charAt(0) : "";
    const second = report.secondName ? report.secondName.charAt(0) : "";

    return `${first}${second}` || "؟";
  };

  return (
    <div className="reports-page">
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon">📄</div>

            <div>
              <h1>التقارير</h1>
              <p>إدارة التقارير والنماذج ومتابعة حالات التسليم</p>
            </div>
          </div>
        </div>

        <div className="create-report-wrapper">
          <button
            className="create-report-btn"
            onClick={() => navigate("/reports/create")}
          >
            <span className="btn-icon">+</span>
            إنشاء تقرير
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span>إجمالي التقارير</span>
            <strong>{stats.totalReports || 0}</strong>
            <p>كل التقارير المنشأة</p>
          </div>
          <div className="stat-icon">📄</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>بانتظار التقييم</span>
            <strong>{stats.pendingReports || 0}</strong>
            <p>في انتظار تقييمك</p>
          </div>
          <div className="stat-icon">⏱</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>قيد المراجعة</span>
            <strong>{stats.reviewReports || 0}</strong>
            <p>تحت المراجعة حاليًا</p>
          </div>
          <div className="stat-icon">🔍</div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span>مكتملة</span>
            <strong>{stats.completedReports || 0}</strong>
            <p>تم الانتهاء منها</p>
          </div>
          <div className="stat-icon">✓</div>
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
            placeholder="ابحث باسم التقرير أو الطالب..."
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
            <p>لم يتم العثور على تقارير مطابقة.</p>
          </div>
        ) : (
          <div className="reports-table">
            <div className="table-head">
              <span>عنوان التقرير</span>
              <span>الطالب</span>
              <span>الحالة</span>
              <span>التاريخ</span>
              <span>الإجراء</span>
            </div>

            {filteredReports.map((report) => { // filteredReports الى reports  بعد مانعدل البحث في الباك اند اعدل 
              const studentName = `${report.firstName || ""} ${
                report.secondName || ""
              } ${report.lastName || ""}`;

              return (
                <div className="table-row" key={report.reportID}>
                  <div className="report-title-cell">
                    <span className="row-file-icon">📄</span>
                    <span>{report.reportTitle || "بدون عنوان"}</span>
                  </div>

                  <div className="student-cell">
                    <span className="student-avatar">
                      {getStudentInitials(report)}
                    </span>
                    <span>{studentName.trim() || "غير محدد"}</span>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(report.status)}`}
                  >
                    {getStatusText(report.status)}
                    <span className="status-check">✓</span>
                  </span>

                  <span className="date-cell">
                    {report.submissionDate || "غير محدد"}
                  </span>

                  <button
                    className="view-report-btn"
                    onClick={() => navigate(`/reports/view/${report.reportID}`)}
                  >
                    عرض
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}