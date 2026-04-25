import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();
//  1. يجيب القالب من TempleteID
// ===============================
export const getTemplateById = async (req, res) => {
  try {
    const { templateID } = req.params;

    const [template] = await db.query(
      "SELECT * FROM TEMPLATE WHERE templateID = ?",
      [templateID]
    );

    if (!template || template.length === 0) {
      return res.status(404).json({
        message: "Template not found"
      });
    }

    res.json(template[0]);

  } catch (error) {
    console.error("Get Template Error:", error);

    res.status(500).json({
      message: "Error fetching template",
      error: error.message
    });
  }
};

// 2. يجيب حقول التمبلت
export const getTemplateFields = async (req, res) => {
  try {
    const { templateID } = req.params;

    const [fields] = await db.query(
      "SELECT * FROM ReportField WHERE templateID = ?",
      [templateID]
    );

    res.json({
      templateID,
      fields
    });

  } catch (error) {
    console.error("Get Fields Error:", error);

    res.status(500).json({
      message: "Error fetching fields",
      error: error.message
    });
  }
};

// 3. اضافه حقول جديدة
export const addReportField = async (req, res) => {
  try {
    const { templateID, fieldLabel, fieldType, isRequired } = req.body;

    await db.query(
      "INSERT INTO ReportField (templateID, fieldLabel, fieldType, isRequired) VALUES (?, ?, ?, ?)",
      [templateID, fieldLabel, fieldType, isRequired]
    );

    res.json({
      message: "Field added successfully"
    });

  } catch (error) {
    console.error("Add Field Error:", error);

    res.status(500).json({
      message: "Error adding field",
      error: error.message
    });
  }
};

//  4. تعديل الحقل

export const updateReportField = async (req, res) => {
  try {
    const { fieldID, fieldLabel, fieldType, isRequired } = req.body;

    await db.query(
      "UPDATE ReportField SET fieldLabel = ?, fieldType = ?, isRequired = ? WHERE fieldID = ?",
      [fieldLabel, fieldType, isRequired, fieldID]
    );

    res.json({
      message: "Field updated successfully"
    });

  } catch (error) {
    console.error("Update Field Error:", error);

    res.status(500).json({
      message: "Error updating field",
      error: error.message
    });
  }
};

//  5.يحذف الحقل 
export const deleteReportField = async (req, res) => {
  try {
    const { fieldID } = req.params;

    await db.query(
      "DELETE FROM ReportField WHERE fieldID = ?",
      [fieldID]
    );

    res.json({
      message: "Field deleted successfully"
    });

  } catch (error) {
    console.error("Delete Field Error:", error);

    res.status(500).json({
      message: "Error deleting field",
      error: error.message
    });
  }
};

//  عرض تقرير كامل للمشرف

export const getSupervisorReport = async (req, res) => {
  try {
    const { reportID } = req.params;

    // 1. جلب التقرير الأساسي
    const [report] = await db.query(
      "SELECT * FROM CASE_REPORT WHERE reportID = ?",
      [reportID]
    );

    if (report.length === 0) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    // 2. جلب الحقول (التمبلت)
    const [fields] = await db.query(
      "SELECT * FROM ReportField WHERE templateID = ?",
      [report[0].templateID]
    );

    // 3. جلب إجابات الطالب
    const [answers] = await db.query(
      `SELECT ra.fieldID, ra.answer, rf.fieldLabel
       FROM REPORT_ANSWER ra
       JOIN ReportField rf ON ra.fieldID = rf.fieldID
       WHERE ra.reportID = ?`,
      [reportID]
    );

    // 4. إرسال كل البيانات
    res.json({
      report: report[0],
      fields: fields,
      answers: answers
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching supervisor report",
      error: error.message
    });
  }
};

