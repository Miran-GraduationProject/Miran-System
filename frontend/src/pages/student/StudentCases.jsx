import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList } from "react-icons/fa";
import "../../styles/reports.css";
import "../../styles/cases.css";

export  function StudentMandatoryCases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/student/cases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setCases([]);
        return;
      }

      setCases(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching cases:", error);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    if (status === "accepted") return "تم القبول";
    if (status === "rejected") return "مرفوض";
    if (status === "pending") return "قيد المراجعة";
    if (status === "needs revision") return "يحتاج تعديل";
    return "غير معروف";
  };

  const getStatusClass = (status) => {
    if (status === "accepted") return "completed";
    if (status === "pending") return "review";
    if (status === "rejected") return "unknown";
    if (status === "needs revision") return "revision";
    return "unknown";
  };

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon"><FaClipboardList /></div>

            <div>
              <h1>الحالات الإلزامية</h1>
              <p>عرض الحالات المرتبطة بك</p>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>قائمة الحالات</h2>
        </div>

        {loading ? (
          <div className="empty-reports">جاري تحميل الحالات...</div>
        ) : cases.length === 0 ? (
          <div className="empty-reports">
            <h3>لا توجد حالات</h3>
            <p>لم يتم العثور على حالات حالياً.</p>
          </div>
        ) : (
          <div className="reports-table">

            {/* Head */}
            <div className="table-head cases-table-head--6col">
              <span>اسم الحالة</span>
              <span>الوصف</span>
              <span>الحالة</span>
              <span>من</span>
              <span>إلى</span>
              <span>الإجراء</span>
            </div>

            {/* Rows */}
          {cases.map((c) => (
  <div className="table-row cases-table-row--6col" key={c.caseID}>

    <div className="report-title-cell">
      <span>{c.caseName}</span>
    </div>

    <span>{c.description_text}</span>

    <span className={`status-badge ${getStatusClass(c.status)}`}>
      {getStatusText(c.status)}
    </span>

    <span>
      {c.startDate
        ? new Date(c.startDate).toLocaleDateString("ar-SA")
        : "غير محدد"}
    </span>

    <span>
      {c.endDate
        ? new Date(c.endDate).toLocaleDateString("ar-SA")
        : "غير محدد"}
    </span>

    <button
      className="view-report-btn"
      disabled={!c.reportID}
      onClick={() => navigate(`/student/reports/fill/${c.reportID}`)}
      title={!c.reportID ? "لم يتم نشر تقرير لهذه الحالة بعد" : ""}
    >
      {!c.reportID ? "غير متاح" : c.submitted ? "عرض التقرير" : "تعبئة التقرير"}
    </button>

  </div>
))}

          </div>
        )}
      </div>
    </div>
  );
}
