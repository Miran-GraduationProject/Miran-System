import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/studentReportFill.css";

export default function StudentReportFill() {
  const navigate = useNavigate();
  const { reportID } = useParams();

  const [report, setReport] = useState(null);
  const [fields, setFields] = useState([]);
  const [formAnswers, setFormAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const getReviewState = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "accept" || value === "accepted") return "accepted";
    if (value === "reject" || value === "rejected") return "rejected";
    if (value === "needs revision") return "needs revision";
    return "pending";
  };

  const isSubmitted = Boolean(report?.submissionID);
  const reviewState = getReviewState(report?.approvalStatus);
  const isApproved = reviewState === "accepted";
  const isExpiredNotSubmitted =
    report?.studentReportState === "EXPIRED_NOT_SUBMITTED";

  const canSubmit = !isSubmitted && !isExpiredNotSubmitted;

  useEffect(() => {
    fetchReport();
  }, [reportID]);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/api/student/report/${reportID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching report:", data);
        setReport(null);
        setFields([]);
        setFormAnswers({});
        return;
      }

      setReport(data.report || null);
      setFields(Array.isArray(data.fields) ? data.fields : []);

      const savedAnswers = {};

      if (Array.isArray(data.answers)) {
        data.answers.forEach((answer) => {
          savedAnswers[answer.fieldID] = answer.answer || "";
        });
      }

      setFormAnswers(savedAnswers);
    } catch (error) {
      console.error("Error fetching report:", error);
      setReport(null);
      setFields([]);
      setFormAnswers({});
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (fieldID, value) => {
    if (!canSubmit) return;

    setFormAnswers((prev) => ({
      ...prev,
      [fieldID]: value,
    }));
  };

  const validateAnswers = () => {
    for (const field of fields) {
      const value = formAnswers[field.fieldID];

      if (field.isRequired && (!value || !String(value).trim())) {
        alert(`يرجى تعبئة الحقل المطلوب: ${field.fieldLabel}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!validateAnswers()) return;

    const answers = fields.map((field) => ({
      fieldID: field.fieldID,
      answer: formAnswers[field.fieldID] || "",
    }));

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:3000/api/student/report/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportID,
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "حدث خطأ أثناء تسليم التقرير");
        return;
      }

      alert("تم تسليم التقرير بنجاح");

      await fetchReport();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("حدث خطأ أثناء تسليم التقرير");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "غير محدد";

    try {
      return new Date(date).toLocaleDateString("ar-SA");
    } catch {
      return "غير محدد";
    }
  };

  const pageTitle = useMemo(() => {
    if (isSubmitted) return "عرض التقرير";
    if (isExpiredNotSubmitted) return "انتهت فترة التقرير";
    return "تعبئة التقرير";
  }, [isSubmitted, isExpiredNotSubmitted]);

  const badgeText = useMemo(() => {
    if (isSubmitted) return "تم التسليم";
    if (isExpiredNotSubmitted) return "انتهت الفترة";
    return "قيد التعبئة";
  }, [isSubmitted, isExpiredNotSubmitted]);

  const reviewStatusText = useMemo(() => {
    if (isExpiredNotSubmitted) return "انتهت الفترة ولم يتم التسليم";
    if (!isSubmitted) return "لم يتم التسليم";
    return reviewState;
  }, [isSubmitted, reviewState, isExpiredNotSubmitted]);

  const renderFieldInput = (field) => {
    const value = formAnswers[field.fieldID] || "";
    const disabled = !canSubmit;

    if (field.fieldType === "textarea") {
      return (
        <textarea
          value={value}
          disabled={disabled}
          onChange={(e) => handleAnswerChange(field.fieldID, e.target.value)}
          placeholder={disabled ? "" : "اكتبي إجابتك هنا..."}
        />
      );
    }

    return (
      <input
        type={
          field.fieldType === "number"
            ? "number"
            : field.fieldType === "date"
            ? "date"
            : "text"
        }
        value={value}
        disabled={disabled}
        onChange={(e) => handleAnswerChange(field.fieldID, e.target.value)}
        placeholder={disabled ? "" : "اكتبي إجابتك هنا..."}
      />
    );
  };

  if (loading) {
    return (
      <div className="student-fill-page">
        <div className="fill-empty">جاري تحميل التقرير...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="student-fill-page">
        <div className="fill-empty">لم يتم العثور على التقرير</div>
      </div>
    );
  }

  return (
    <div className="student-fill-page">
      <div className="fill-header">
        <div className="fill-title">
          <div className="fill-page-icon">📄</div>

          <div>
            <h1>{pageTitle}</h1>
            <p>
              {report.reportTitle || "بدون عنوان"} - تاريخ النشر:{" "}
              {formatDate(report.publishedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="fill-layout">
        <div className="fill-form-card">
          <div className="fill-card-title">
            <h2>{report.reportTitle || "تقرير التدريب"}</h2>

            <span
              className={`fill-badge ${
                isExpiredNotSubmitted ? "expired-badge" : ""
              }`}
            >
              {badgeText}
            </span>
          </div>

          {(isSubmitted || isExpiredNotSubmitted) && (
            <div
              className="supervisor-decision-box"
              style={{ marginBottom: "22px" }}
            >
              <div
                className={`decision-icon ${
                  isApproved
                    ? "approved"
                    : isExpiredNotSubmitted
                    ? "expired"
                    : "pending"
                }`}
              >
                {isApproved ? "✓" : isExpiredNotSubmitted ? "!" : "⏳"}
              </div>

              <div>
                <span>حالة التقرير</span>
                <strong>{reviewStatusText}</strong>
              </div>
            </div>
          )}

          {fields.length === 0 ? (
            <div className="fill-empty">لا توجد حقول في هذا التقرير</div>
          ) : (
            <div className="fill-fields">
              {fields.map((field) => (
                <div className="fill-field" key={field.fieldID}>
                  <label>
                    {field.fieldLabel}
                    {field.isRequired ? <span> *</span> : null}
                  </label>

                  {renderFieldInput(field)}
                </div>
              ))}
            </div>
          )}

          <div className="fill-actions">
            <button
              type="button"
              className="secondary-fill-btn"
              onClick={() => navigate("/student/reports")}
            >
              رجوع
            </button>

            {canSubmit && (
              <button
                type="button"
                className="primary-fill-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "جاري التسليم..." : "تسليم التقرير"}
              </button>
            )}
          </div>
        </div>

        {canSubmit ? (
          <div className="fill-info-card">
            <h2>تعليمات</h2>

            <div className="info-item">
              <span>1</span>
              <p>يرجى تعبئة جميع الحقول المطلوبة قبل تسليم التقرير.</p>
            </div>

            <div className="info-item">
              <span>2</span>
              <p>بعد التسليم لن تتمكني من تعديل إجابات التقرير.</p>
            </div>

            <div className="info-item">
              <span>3</span>
              <p>بعد التسليم سيظهر التقرير للمشرف لمراجعته والموافقة عليه.</p>
            </div>
          </div>
        ) : (
          <div className="fill-info-card review-side-card">
            <h2>{isExpiredNotSubmitted ? "حالة التقرير" : "موافقة المشرف"}</h2>

            <div className="supervisor-decision-box">
              <div
                className={`decision-icon ${
                  isApproved
                    ? "approved"
                    : isExpiredNotSubmitted
                    ? "expired"
                    : "pending"
                }`}
              >
                {isApproved ? "✓" : isExpiredNotSubmitted ? "!" : "⏳"}
              </div>

              <div>
                <span>حالة التقرير</span>
                <strong>{reviewStatusText}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
