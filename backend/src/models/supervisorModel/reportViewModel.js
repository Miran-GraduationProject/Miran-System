import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* =================  عرض التقرير================= */
export const getReport = async (reportID) => {
  const [rows] = await db.execute(
    "SELECT * FROM CASE_REPORT WHERE reportID = ?",
    [reportID]
  );

  return rows;
};


// عرض إجابات الطالب
export const getReportAnswers = async (reportID) => {
  const [rows] = await db.execute(
    `SELECT ra.fieldID, ra.answer, rf.fieldLabel
     FROM REPORT_ANSWER ra
     JOIN ReportField rf ON ra.fieldID = rf.fieldID
     WHERE ra.reportID = ?`,
    [reportID]
  );

  return rows;
};


/**
 * هذا الملف مسؤول عن عرض التقارير 
 * يستخدمه الطالب أو المشرف لعرض التقرير والإجابات بدون تعديل
 *
 * الوظائف:
 * 1. يجيب التقرير حسب ID
 * 2. يجيب إجابات الطالب المرتبطة بالتقرير
 */
