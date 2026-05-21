import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* ================= التمبلت ================= */

export const getTemplateById = async (templateID) => {
  const [rows] = await db.execute(
    "SELECT * FROM TEMPLATE WHERE templateID = ?",
    [templateID]
  );

  return rows;



};

/* ================= انشاء التمبلت ================= */

export const createTemplate = async (academicSupervisorID, reportTitle) => {
  const [result] = await db.execute(
    `INSERT INTO TEMPLATE 
     (academicSupervisorID, reportTitle, templateDate, reportDate, created_at, updated_at)
     VALUES (?, ?, NOW(), NOW(), NOW(), NOW())`,
    [academicSupervisorID, reportTitle]
  );

  return result;
};
/* ================= حقول التمبلت ================= */

export const getTemplateFields = async (templateID) => {
  const [rows] = await db.execute(
    "SELECT * FROM ReportField WHERE templateID = ?",
    [templateID]
  );

  return rows;
};

// إضافة حقل
export const addReportField = async (templateID, fieldLabel, fieldType, isRequired) => {
  await db.execute(
    `INSERT INTO ReportField (templateID, fieldLabel, fieldType, isRequired)
     VALUES (?, ?, ?, ?)`,
    [templateID, fieldLabel, fieldType, isRequired]
  );
};

// تعديل حقل
export const updateReportField = async (fieldID, fieldLabel, fieldType, isRequired) => {
  await db.execute(
    `UPDATE ReportField 
     SET fieldLabel = ?, fieldType = ?, isRequired = ?
     WHERE fieldID = ?`,
    [fieldLabel, fieldType, isRequired, fieldID]
  );
};

// حذف حقل
export const deleteReportField = async (fieldID) => {
  await db.execute(
    "DELETE FROM ReportField WHERE fieldID = ?",
    [fieldID]
  );
};




/**
 * هذا الملف مسؤول عن إدارة التمبلت وحقوله داخل التقارير
 * يستخدم من قبل المشرف 
 * الوظائف:
 * 1. يجيب التمبلت حسب ID
 * 2. يجيب حقول التمبلت (الأسئلة)
 * 3. إضافة حقل جديد للتمبلت
 * 4. تعديل حقل موجود
 * 5. حذف حقل من التمبلت
 */

// ========== تعديل بعد ماشفت الفرونت 
// ================= جلب كل القوالب =================

export const getAllTemplates = async () => {
  const [rows] = await db.execute(`
    SELECT 
      t.templateID,
      t.reportTitle,
      t.templateDate,
      t.reportDate,
      t.created_at,
      COUNT(rf.fieldID) AS fieldsCount
    FROM TEMPLATE t
    LEFT JOIN ReportField rf ON t.templateID = rf.templateID
    GROUP BY 
      t.templateID,
      t.reportTitle,
      t.templateDate,
      t.reportDate,
      t.created_at
    ORDER BY t.templateID DESC
  `);

  return rows;
};



//----------------حطيت الحذف هنا ي رزان----------------
export const deleteTemplateAndFields = async (templateID) => {
  await db.execute(
    "DELETE FROM REPORT_ANSWER WHERE reportID IN (SELECT reportID FROM CASE_REPORT WHERE templateID = ?)",
    [templateID]
  );

  await db.execute(
    "DELETE FROM CASE_REPORT WHERE templateID = ?",
    [templateID]
  );

  await db.execute(
    "DELETE FROM ReportField WHERE templateID = ?",
    [templateID]
  );

  const [result] = await db.execute(
    "DELETE FROM TEMPLATE WHERE templateID = ?",
    [templateID]
  );

  return result;
};