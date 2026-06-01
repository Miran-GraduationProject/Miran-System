import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import "../../styles/reports.css";
import "../../styles/cases.css";

export default function AddCase() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [templates, setTemplates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    caseName: "",
    description_text: "",
    notes: "",
    templateID: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:3000/api/supervisor/templates", { headers })
      .then((r) => r.json())
      .then((data) => {
        console.log("Templates API response:", data);
        setTemplates(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Templates fetch error:", err);
        setTemplates([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const selectedTemplate = templates.find(
      (t) => String(t.templateID) === form.templateID
    );

    if (!selectedTemplate) { setError("يرجى اختيار قالب التقرير"); return; }
    if (!form.startDate)   { setError("يرجى تحديد تاريخ البداية"); return; }
    if (!form.endDate)     { setError("يرجى تحديد تاريخ النهاية"); return; }
    if (form.startDate >= form.endDate) { setError("تاريخ البداية يجب أن يكون قبل تاريخ النهاية"); return; }

    const startDate = form.startDate;
    const endDate   = form.endDate;

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/supervisor/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseName: form.caseName.trim(),
          description_text: form.description_text.trim(),
          notes: form.notes.trim() || undefined,
          reportTitle: selectedTemplate.reportTitle,
          startDate,
          endDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message || "حدث خطأ أثناء إضافة الحالة"); return; }

      setSuccess(true);
      setTimeout(() => navigate("/supervisor/cases"), 1500);
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reports-page">
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon"><FaPlus /></div>
            <div>
              <h1 style={{ whiteSpace: "nowrap" }}>إضافة حالة إلزامية</h1>
              <p style={{ whiteSpace: "nowrap" }}>إضافة حالة جديدة لجميع الطلاب</p>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-list-box">
        <div className="reports-list-header">
          <h2>بيانات الحالة</h2>
        </div>

        {success ? (
          <div className="empty-reports">
            <h3>تمت الإضافة بنجاح</h3>
            <p>جاري التحويل...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="case-form">

            <div className="form-group">
              <label>اسم الحالة <span style={{ color: "#e53e3e" }}>*</span></label>
              <input
                type="text"
                name="caseName"
                value={form.caseName}
                onChange={handleChange}
                required
                placeholder="أدخل اسم الحالة"
              />
            </div>

            <div className="form-group">
              <label>الوصف <span style={{ color: "#e53e3e" }}>*</span></label>
              <textarea
                name="description_text"
                value={form.description_text}
                onChange={handleChange}
                required
                rows={4}
                placeholder="أدخل وصفاً للحالة"
              />
            </div>

            <div className="form-group">
              <label>ملاحظات (اختياري)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="أي ملاحظات إضافية"
              />
            </div>

            <div className="form-group">
              <label>قالب التقرير <span style={{ color: "#e53e3e" }}>*</span></label>
              <select name="templateID" value={form.templateID} onChange={handleChange} required>
                <option value="">-- اختر القالب --</option>
                {templates.map((t) => (
                  <option key={t.templateID} value={t.templateID}>{t.reportTitle}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>تاريخ البداية *</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>تاريخ النهاية *</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button type="button" className="cases-btn-secondary" onClick={() => navigate("/supervisor/cases")}>
                رجوع
              </button>
              <button type="submit" className="cases-btn-primary" disabled={submitting}>
                {submitting ? "جاري الحفظ..." : "إضافة الحالة"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
