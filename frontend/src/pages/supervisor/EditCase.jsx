import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import "../../styles/reports.css";
import "../../styles/cases.css";

export default function EditCase() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cases, setCases] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingID, setEditingID] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successID, setSuccessID] = useState(null);

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

    Promise.all([
      fetch("http://localhost:3000/api/supervisor/cases", { headers }).then((r) => r.json()),
      fetch("http://localhost:3000/api/supervisor/templates", { headers }).then((r) => r.json()),
    ])
      .then(([casesData, templatesData]) => {
        setCases(Array.isArray(casesData.data) ? casesData.data : []);
        setTemplates(Array.isArray(templatesData) ? templatesData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (c) => {
    setEditingID(c.caseID);
    setError("");
    setSuccessID(null);
    setForm({
      caseName: c.caseName || "",
      description_text: c.description_text || "",
      notes: c.notes || "",
      templateID: String(c.templateID || ""),
      startDate: c.startDate?.slice(0, 10) || "",
      endDate: c.endDate?.slice(0, 10) || "",
    });
  };

  const cancelEdit = () => { setEditingID(null); setError(""); };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const selectedTemplate = templates.find((t) => String(t.templateID) === form.templateID);

    if (!form.startDate || !form.endDate) { setError("يرجى تحديد تاريخ البداية والنهاية"); return; }
    if (form.startDate >= form.endDate)   { setError("تاريخ البداية يجب أن يكون قبل تاريخ النهاية"); return; }

    const body = {
      caseName: form.caseName.trim(),
      description_text: form.description_text.trim(),
      notes: form.notes.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    if (selectedTemplate) body.reportTitle = selectedTemplate.reportTitle;

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/supervisor/cases/${editingID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message || "حدث خطأ أثناء التعديل"); return; }

      setCases((prev) =>
        prev.map((c) =>
          c.caseID === editingID
            ? { ...c, caseName: body.caseName, description_text: body.description_text, notes: body.notes ?? c.notes, templateID: selectedTemplate?.templateID ?? c.templateID }
            : c
        )
      );
      setSuccessID(editingID);
      setEditingID(null);
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
            <div className="page-icon"><FaEdit /></div>
            <div>
              <h1 style={{ whiteSpace: "nowrap" }}>تحديث الحالات الإلزامية</h1>
              <p style={{ whiteSpace: "nowrap" }}>اختر الحالة التي تريد تحديثها</p>
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
              <div key={c.caseID}>
                <div className="table-row cases-table-row">
                  <div className="report-title-cell">
                    <span>{c.caseName}</span>
                    {successID === c.caseID && (
                      <span className="status-badge completed" style={{ marginRight: "8px" }}>
                        تم التعديل
                      </span>
                    )}
                  </div>
                  <span>{c.description_text}</span>
                  <button
                    className="view-report-btn"
                    onClick={() => editingID === c.caseID ? cancelEdit() : startEdit(c)}
                  >
                    {editingID === c.caseID ? "إلغاء" : "تعديل"}
                  </button>
                </div>

                {editingID === c.caseID && (
                  <div className="edit-panel">
                    <form onSubmit={handleSubmit} className="case-form">

                      <div className="form-group">
                        <label>اسم الحالة <span style={{ color: "#e53e3e" }}>*</span></label>
                        <input type="text" name="caseName" value={form.caseName} onChange={handleChange} required />
                      </div>

                      <div className="form-group">
                        <label>الوصف <span style={{ color: "#e53e3e" }}>*</span></label>
                        <textarea name="description_text" value={form.description_text} onChange={handleChange} required rows={3} />
                      </div>

                      <div className="form-group">
                        <label>ملاحظات (اختياري)</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
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
                        <label>تاريخ بداية التسليم <span style={{ color: "#e53e3e" }}>*</span></label>
                        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                      </div>

                      <div className="form-group">
                        <label>تاريخ نهاية التسليم <span style={{ color: "#e53e3e" }}>*</span></label>
                        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
                      </div>

                      {error && <p className="form-error">{error}</p>}

                      <div className="form-actions">
                        <button type="button" className="cases-btn-secondary" onClick={cancelEdit}>إلغاء</button>
                        <button type="submit" className="cases-btn-primary" disabled={submitting}>
                          {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                      </div>

                    </form>
                  </div>
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
