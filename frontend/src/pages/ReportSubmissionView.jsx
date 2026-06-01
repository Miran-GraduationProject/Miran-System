import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ReportView.css";

const getStatusInfo = (status) => {
  const v = String(status || "");
  if (v === "قبول" || v.toLowerCase() === "accept" || v.toLowerCase() === "accepted")
    return { cls: "accepted", label: "قبول" };
  if (v === "رفض" || v.toLowerCase() === "reject" || v.toLowerCase() === "rejected")
    return { cls: "rejected", label: "رفض" };
  return { cls: "pending", label: "قيد المراجعة" };
};

function ReportSubmissionView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  const currentUserId = useMemo(() => {
    try {
      return JSON.parse(atob(token.split(".")[1])).id;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const reportRes = await fetch(
          `http://localhost:3000/api/supervisor/submission/${id}/answers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const reportData = await reportRes.json();

        if (!reportRes.ok) {
          setReport(null);
          setAnswers([]);
          return;
        }

        setReport(reportData.submission || null);
        setAnswers(reportData.submission?.answers || []);
      } catch (error) {
        console.error("Error fetching report:", error);
        setReport(null);
        setAnswers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, token]);

  const mergedDetails = useMemo(
    () =>
      answers.map((answer) => ({
        label: answer.fieldLabel || "حقل",
        answer: answer.answer || "-",
      })),
    [answers]
  );

  const statusInfo = getStatusInfo(report?.approvalStatus);

  const handleReview = async (decision) => {
    try {
      setUpdating(true);

      const res = await fetch(
        `http://localhost:3000/api/reviewCase/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decision, supervisorId: currentUserId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "حدث خطأ أثناء تحديث حالة التقرير");
        return;
      }

      setReport((prev) => ({
        ...prev,
        approvalStatus: data.data?.approvalStatus || decision,
        approvedBy: currentUserId,
        approvedAt: new Date().toISOString(),
      }));

      const msg = decision === "قبول" ? "تم قبول التقرير بنجاح" : "تم رفض التقرير";
      setToast({ text: msg, type: decision === "قبول" ? "accept" : "reject" });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Error updating report status:", error);
      setToast({ text: "حدث خطأ أثناء تحديث الحالة", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <h2 className="report-view-container">جاري تحميل التقرير...</h2>;
  }

  if (!report) {
    return <h2 className="report-view-container">لم يتم العثور على التقرير</h2>;
  }

  return (
    <div className="report-view-container">
      {toast && (
        <div className={`review-toast review-toast-${toast.type}`}>
          {toast.text}
        </div>
      )}
      <h1 className="page-title">تفاصيل التقرير</h1>

      <div className="report-card">
        <h2>{report.reportTitle || "بدون عنوان"}</h2>

        <span className={`report-status report-status-${statusInfo.cls}`}>
          {statusInfo.label}
        </span>

        <p>
          <strong>تاريخ النشر:</strong> {report.approvedAt || "-"}
        </p>
        <p>
          <strong>تاريخ التسليم:</strong> {report.submissionDate || "-"}
        </p>
        <p>
          <strong>وقت التسليم:</strong> {report.submissionTime || "-"}
        </p>
        <p>
          <strong>المراجع:</strong> {report.approvedBy || "pending"}
        </p>
      </div>

      <h2 className="page-title">تفاصيل الحقول</h2>

      <div className="fields-container">
        {mergedDetails.length === 0 ? (
          <p>لا توجد بيانات لعرضها.</p>
        ) : (
          mergedDetails.map((item, index) => (
            <div key={index} className="field-box">
              <p className="field-label">
                <strong>{item.label}</strong>
              </p>
              <p className="field-answer">{item.answer}</p>
            </div>
          ))
        )}
      </div>

      <div className="supervisor-buttons">
        <span className="supervisor-review-label">رأي المشرف:</span>
        <button
          className="supervisor-btn supervisor-btn-accept"
          disabled={updating}
          type="button"
          onClick={() => handleReview("قبول")}
        >
          قبول
        </button>
        <button
          className="supervisor-btn supervisor-btn-reject"
          disabled={updating}
          type="button"
          onClick={() => handleReview("رفض")}
        >
          رفض
        </button>
      </div>

      <button
        className="back-button"
        type="button"
        onClick={() => navigate(-1)}
      >
        رجوع
      </button>
    </div>
  );
}



export default ReportSubmissionView;
