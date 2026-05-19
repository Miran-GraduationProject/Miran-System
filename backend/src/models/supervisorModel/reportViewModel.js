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
 // ====== بعد تعديل الفرونت
// ================= جلب كل التقارير =================
export const getAllReports = async () => {
  const [rows] = await db.execute(`
    SELECT 
      cr.reportID,
      cr.status,
      cr.decision,
      cr.submissionDate,
      cr.submissionTime,
      cr.templateID,
      cr.studentID,
      cr.periodID,
      t.reportTitle,
      u.firstName,
      u.secondName,
      u.lastName
    FROM CASE_REPORT cr
    LEFT JOIN TEMPLATE t ON cr.templateID = t.templateID
    LEFT JOIN \`User\` u ON cr.studentID = u.userID
    ORDER BY cr.reportID DESC
  `);

  return rows;
};

// ================= إحصائيات التقارير =================

export const getReportsStats = async () => {
  const [rows] = await db.execute(`
    SELECT
      COUNT(*) AS totalReports,
      SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) AS pendingReports,
      SUM(CASE WHEN status = 'Under Review' THEN 1 ELSE 0 END) AS reviewReports,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedReports
    FROM CASE_REPORT
  `);

  return rows[0];
};