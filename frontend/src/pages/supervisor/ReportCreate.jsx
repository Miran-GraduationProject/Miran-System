import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/reportCreate.css";
import { FiFileText, FiTrash2, FiCheck, FiPlus } from "react-icons/fi";

export default function ReportCreate() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/api/supervisor/templates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Error response:", data);
        setTemplates([]);
        return;
      }

      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const startFromScratch = () => {
    navigate("/templates");
  };

  const useTemplate = (templateID) => {
    navigate(`/templates?templateID=${templateID}`);
  };

  const editAsCopy = (templateID) => {
    navigate(`/templates?templateID=${templateID}&copy=true`);
  };

  const handleDeleteTemplate = async (templateID) => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد من رغبتك في حذف هذا القالب نهائياً؟"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/api/supervisor/templates/${templateID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }

      setTemplates((currentTemplates) =>
        currentTemplates.filter((template) => template.templateID !== templateID)
      );
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("حدث خطأ أثناء حذف القالب");
    }
  };

  return (
    <div className="create-report-page">
      <div className="create-report-header">
        <div className="header-icon">
          <FiFileText />
        </div>

        <div>
          <h1>إنشاء تقرير جديد</h1>
          <p>اختار قالبًا محفوظًا أو ابني تقرير جديد من الصفر</p>
        </div>
      </div>

      <div className="create-options">
        <div className="steps-card">
          <div className="card-title-row">
            <span className="small-card-icon">
              <FiCheck />
            </span>

            <h3>خطوات إنشاء التقرير</h3>
          </div>

          <div className="step">
            <span>1</span>
            <p>اختار قالبًا جاهزًا أو قم بإنشاء تقريرًا جديدًا.</p>
          </div>

          <div className="step">
            <span>2</span>
            <p>عدل الحقول حسب احتياج التقرير.</p>
          </div>

          <div className="step">
            <span>3</span>
            <p>احفظ التقرير أو انشره للطلاب.</p>
          </div>
        </div>

        <div className="create-card">
          <div className="plus-circle">
            <FiPlus />
          </div>

          <h2>إنشاء من الصفر</h2>

          <p>
            صمم تقرير جديد واضف الحقول المطلوبة للطلاب، ثم احفظه كقالب أو انشره
            مباشرة.
          </p>

          <button onClick={startFromScratch}>ابدأ الآن</button>
        </div>
      </div>

      <div className="templates-section">
        <div className="templates-title">
          <h2>القوالب المحفوظة</h2>
          <p>يمكنك استخدام قالب جاهز كما هو أو تعديله وحفظه كقالب جديد.</p>
        </div>

        {loading ? (
          <div className="empty-template">جاري تحميل القوالب...</div>
        ) : templates.length === 0 ? (
          <div className="empty-template">لا توجد قوالب محفوظة</div>
        ) : (
          <div className="templates-grid">
            {templates.map((template) => (
              <div className="template-card" key={template.templateID}>
                <div className="template-top">
                  <span
                    className="template-badge"
                    onClick={() => handleDeleteTemplate(template.templateID)}
                    title="حذف القالب"
                  >
                    <FiTrash2 size={18} />
                  </span>

                  <span className="template-icon">
                    <FiFileText />
                  </span>
                </div>

                <h3>{template.reportTitle || "بدون عنوان"}</h3>

                <p>
                  التاريخ:{" "}
                  {template.created_at
                    ? new Date(template.created_at).toLocaleDateString("ar-SA")
                    : "غير محدد"}
                </p>

                <div className="fields-count">
                  <span>عدد الحقول</span>
                  <strong>{template.fieldsCount || 0}</strong>
                </div>

                <div className="template-buttons">
                  <button onClick={() => useTemplate(template.templateID)}>
                    استخدام
                  </button>

                  <button
                    className="outline-btn"
                    onClick={() => editAsCopy(template.templateID)}
                  >
                    تعديل كنسخة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}