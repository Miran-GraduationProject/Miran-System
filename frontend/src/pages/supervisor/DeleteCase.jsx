import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import "../../styles/reports.css";
import "../../styles/cases.css";

export default function DeleteCase() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingID, setDeletingID] = useState(null);
  const [confirmID, setConfirmID] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/supervisor/cases", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setCases(Array.isArray(data.data) ? data.data : []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (caseID) => {
    setDeletingID(caseID);
    try {
      const res = await fetch(`http://localhost:3000/api/supervisor/cases/${caseID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "حدث خطأ أثناء الحذف");
        return;
      }

      setCases((prev) => prev.filter((c) => c.caseID !== caseID));
      setConfirmID(null);
    } catch {
      alert("تعذّر الاتصال بالخادم");
    } finally {
      setDeletingID(null);
    }
  };

  return (
    <div className="reports-page">
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon"><FiTrash2 /></div>
            <div>
              <h1 style={{ whiteSpace: "nowrap" }}>حذف الحالات الإلزامية</h1>
              <p style={{ whiteSpace: "nowrap" }}>اختر الحالة التي تريد حذفها</p>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>قائمة الحالات</h2>
        </div>

        {loading ? (
          <div className="empty-reports">جاري تحميل الحالات...</div>
        ) : cases.length === 0 ? (
          <div className="empty-reports">
            <h3>لا توجد حالات</h3>
            <p>لم يتم إضافة أي حالات بعد.</p>
          </div>
        ) : (
          <div className="reports-table">
            <div className="table-head cases-table-head">
              <span>اسم الحالة</span>
              <span>الوصف</span>
              <span>الإجراء</span>
            </div>

            {cases.map((c) => (
              <div className="table-row cases-table-row" key={c.caseID}>
                <div className="report-title-cell">
                  <span>{c.caseName}</span>
                </div>
                <span>{c.description_text}</span>

                {confirmID === c.caseID ? (
                  <div className="confirm-row">
                    <button
                      className="cases-btn-danger"
                      disabled={deletingID === c.caseID}
                      onClick={() => handleDelete(c.caseID)}
                    >
                      {deletingID === c.caseID ? "جاري الحذف..." : "تأكيد الحذف"}
                    </button>
                    <button className="cases-btn-secondary" onClick={() => setConfirmID(null)}>
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button className="cases-btn-danger" onClick={() => setConfirmID(c.caseID)}>
                    حذف
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: "16px" }}>
        <button className="cases-btn-secondary" onClick={() => navigate("/supervisor/cases")}>
          رجوع
        </button>
      </div>
    </div>
  );
}
