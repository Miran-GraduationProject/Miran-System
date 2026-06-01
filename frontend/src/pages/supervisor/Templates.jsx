import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiFileText, FiPlus } from "react-icons/fi";
import "../../styles/templates.css";

const FIELD_TYPES = [
  { value: "text", label: "نص قصير" },
  { value: "textarea", label: "نص طويل" },
  { value: "date", label: "تاريخ" },
  { value: "number", label: "رقم" },
];

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const templateIDFromUrl = searchParams.get("templateID");
  const isCopy = searchParams.get("copy") === "true";

  const [templateID, setTemplateID] = useState(templateIDFromUrl || null);
  const [reportTitle, setReportTitle] = useState("");
  const [periodID, setPeriodID] = useState("");
  const [periods, setPeriods] = useState([]);

  const [fields, setFields] = useState([
    {
      fieldLabel: "",
      fieldType: "text",
      isRequired: true,
      isNew: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const jsonAuthHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchTrainingPeriods();

    if (templateIDFromUrl) {
      fetchTemplate(templateIDFromUrl);
      fetchTemplateFields(templateIDFromUrl);
    }
  }, [templateIDFromUrl]);

  const fetchTrainingPeriods = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/supervisor/training-periods",
        {
          headers: authHeaders,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching training periods:", data);
        setPeriods([]);
        return;
      }

      setPeriods(Array.isArray(data.periods) ? data.periods : []);
    } catch (error) {
      console.error("Error fetching training periods:", error);
      setPeriods([]);
    }
  };

  const fetchTemplate = async (id) => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/api/supervisor/template/${id}`,
        {
          headers: authHeaders,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching template:", data);
        return;
      }

      if (data.reportTitle) {
        setReportTitle(isCopy ? `${data.reportTitle} - نسخة` : data.reportTitle);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateFields = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/supervisor/template-fields/${id}`,
        {
          headers: authHeaders,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching template fields:", data);
        return;
      }

      if (Array.isArray(data.fields) && data.fields.length > 0) {
        setFields(
          data.fields.map((field) => ({
            fieldID: field.fieldID,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
            isRequired: field.isRequired === 1 || field.isRequired === true,
            isNew: isCopy,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };

  const validFields = useMemo(() => {
    return fields.filter((field) => field.fieldLabel.trim() !== "");
  }, [fields]);

  const addField = () => {
    setFields((currentFields) => [
      ...currentFields,
      {
        fieldLabel: "",
        fieldType: "text",
        isRequired: true,
        isNew: true,
      },
    ]);
  };

  const updateFieldValue = (index, key, value) => {
    setFields((currentFields) => {
      const updatedFields = [...currentFields];

      updatedFields[index] = {
        ...updatedFields[index],
        [key]: value,
      };

      return updatedFields;
    });
  };

  const deleteFieldFromDatabase = async (fieldID) => {
    const res = await fetch(
      `http://localhost:3000/api/supervisor/field/${fieldID}`,
      {
        method: "DELETE",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          templateID,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "حدث خطأ أثناء حذف الحقل");
    }
  };

  const removeField = async (index) => {
    const field = fields[index];

    if (field.fieldID && !isCopy) {
      const confirmDelete = window.confirm("هل تريدين حذف هذا الحقل؟");

      if (!confirmDelete) return;

      try {
        await deleteFieldFromDatabase(field.fieldID);
      } catch (error) {
        console.error("Error deleting field:", error);
        alert(error.message || "حدث خطأ أثناء حذف الحقل");
        return;
      }
    }

    setFields((currentFields) =>
      currentFields.filter((_, fieldIndex) => fieldIndex !== index)
    );
  };

  const createTemplate = async () => {
    const templateRes = await fetch(
      "http://localhost:3000/api/supervisor/template",
      {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          reportTitle: reportTitle.trim(),
        }),
      }
    );

    const templateData = await templateRes.json();

    if (!templateRes.ok) {
      throw new Error(templateData.message || "Error creating template");
    }

    return templateData.templateID;
  };

  const addFieldToTemplate = async (selectedTemplateID, field) => {
    const fieldRes = await fetch("http://localhost:3000/api/supervisor/field", {
      method: "POST",
      headers: jsonAuthHeaders,
      body: JSON.stringify({
        templateID: selectedTemplateID,
        fieldLabel: field.fieldLabel.trim(),
        fieldType: field.fieldType,
        isRequired: field.isRequired ? 1 : 0,
      }),
    });

    const fieldData = await fieldRes.json().catch(() => ({}));

    if (!fieldRes.ok) {
      throw new Error(fieldData.message || "Error adding field");
    }
  };

  const updateFieldInTemplate = async (field) => {
    const res = await fetch("http://localhost:3000/api/supervisor/field", {
      method: "PUT",
      headers: jsonAuthHeaders,
      body: JSON.stringify({
        templateID,
        fieldID: field.fieldID,
        fieldLabel: field.fieldLabel.trim(),
        fieldType: field.fieldType,
        isRequired: field.isRequired ? 1 : 0,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Error updating field");
    }
  };

  const createNewTemplateWithFields = async () => {
    const newTemplateID = await createTemplate();

    for (const field of validFields) {
      await addFieldToTemplate(newTemplateID, field);
    }

    setTemplateID(newTemplateID);
    return newTemplateID;
  };

  const updateExistingTemplateFields = async () => {
    for (const field of validFields) {
      if (field.fieldID && !field.isNew) {
        await updateFieldInTemplate(field);
      } else {
        await addFieldToTemplate(templateID, field);
      }
    }

    return templateID;
  };

  const saveTemplate = async (showMessage = true) => {
    if (!reportTitle.trim()) {
      alert("اكتب عنوان التقرير");
      return null;
    }

    if (validFields.length === 0) {
      alert("أضيف حقل واحد على الأقل");
      return null;
    }

    try {
      setSaving(true);

      let savedTemplateID;

      if (!templateID || isCopy) {
        savedTemplateID = await createNewTemplateWithFields();
      } else {
        savedTemplateID = await updateExistingTemplateFields();
      }

      if (showMessage) {
        alert("تم حفظ القالب بنجاح");
      }

      return savedTemplateID;
    } catch (error) {
      console.error("Error saving template:", error);
      alert(error.message || "حدث خطأ أثناء حفظ القالب");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const createReport = async () => {
    if (!periodID) {
      alert("اختار الفترة التدريبية قبل النشر");
      return;
    }

    const savedTemplateID = await saveTemplate(false);

    if (!savedTemplateID) return;

    try {
      const res = await fetch(
        "http://localhost:3000/api/supervisor/create-report",
        {
          method: "POST",
          headers: jsonAuthHeaders,
          body: JSON.stringify({
            templateID: savedTemplateID,
            periodID,
            reportTitle: reportTitle.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "حدث خطأ أثناء نشر التقرير");
        return;
      }

      alert("تم نشر التقرير للطلاب بنجاح");
      navigate("/reports");
    } catch (error) {
      console.error("Error creating report:", error);
      alert("حدث خطأ أثناء نشر التقرير");
    }
  };

  if (loading) {
    return <div className="builder-page">جاري تحميل التقرير...</div>;
  }

  return (
    <div className="builder-page">
      <div className="builder-header">
        <div className="builder-title">
          <div className="builder-page-icon">
            <FiFileText />
          </div>

          <div>
            <h1>بناء التقرير</h1>
            <p>أضيف الحقول المطلوبة وشاهد المعاينة قبل الحفظ أو النشر.</p>
          </div>
        </div>
      </div>

      <div className="builder-layout">
        <div className="builder-form-card">
          <h2>معلومات التقرير</h2>

          <label>عنوان التقرير</label>
          <input
            type="text"
            placeholder="مثال: تقرير التدريب الأسبوعي"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
          />

          <label>الفترة التدريبية</label>
          <select
            value={periodID}
            onChange={(e) => setPeriodID(e.target.value)}
          >
            <option value="">اختاري الفترة التدريبية</option>

            {periods.map((period) => (
              <option key={period.periodID} value={period.periodID}>
                {period.name} - {period.level} (
                {new Date(period.startDate).toLocaleDateString("ar-SA")} إلى{" "}
                {new Date(period.endDate).toLocaleDateString("ar-SA")})
              </option>
            ))}
          </select>

          <div className="fields-title">
            <h3>حقول التقرير</h3>

            <button type="button" onClick={addField}>
              <FiPlus />
              إضافة حقل
            </button>
          </div>

          <div className="fields-list">
            {fields.map((field, index) => (
              <div className="field-box" key={index}>
                <div className="field-row">
                  <div>
                    <label>اسم الحقل</label>
                    <input
                      type="text"
                      placeholder="مثال: المهام المنجزة"
                      value={field.fieldLabel}
                      onChange={(e) =>
                        updateFieldValue(index, "fieldLabel", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label>نوع الحقل</label>
                    <select
                      value={field.fieldType}
                      onChange={(e) =>
                        updateFieldValue(index, "fieldType", e.target.value)
                      }
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-actions">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) =>
                        updateFieldValue(index, "isRequired", e.target.checked)
                      }
                    />
                    إجباري
                  </label>

                  <button type="button" onClick={() => removeField(index)}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="builder-buttons">
            <button
              className="secondary-btn"
              type="button"
              onClick={() => saveTemplate(true)}
              disabled={saving}
            >
              حفظ كقالب
            </button>

            <button
              className="primary-btn"
              type="button"
              onClick={createReport}
              disabled={saving}
            >
              نشر التقرير
            </button>
          </div>
        </div>

        <div className="preview-card">
          <h2>معاينة التقرير</h2>

          <div className="preview-paper">
            <h3>{reportTitle || "عنوان التقرير"}</h3>
            <p>هذه معاينة لما سيظهر للطالب عند تعبئة التقرير.</p>

            {validFields.length === 0 ? (
              <div className="empty-preview">لا توجد حقول بعد</div>
            ) : (
              validFields.map((field, index) => (
                <div className="preview-field" key={index}>
                  <label>
                    {field.fieldLabel}
                    {field.isRequired && <span> *</span>}
                  </label>

                  {field.fieldType === "textarea" ? (
                    <textarea disabled placeholder="إجابة الطالب" />
                  ) : (
                    <input
                      disabled
                      type={
                        field.fieldType === "number"
                          ? "number"
                          : field.fieldType === "date"
                          ? "date"
                          : "text"
                      }
                      placeholder="إجابة الطالب"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}