import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* =================  التقرير ================= */

const getReport = async (reportID) => {
  const [rows] = await db.execute(
    "SELECT * FROM CASE_REPORT WHERE reportID = ?",
    [reportID]
  );

  return rows;
};


/* ================= حقول التقرير  ================= */

const getReportFields = async (templateID) => {
  const [rows] = await db.execute(
    "SELECT * FROM ReportField WHERE templateID = ?",
    [templateID]
  );

  return rows;
};


/* =================  حفظ إجابات الطالب في التقرير================ */

const submitReportAnswers = async (reportID, answers) => {

  // حماية لو ما فيه إجابات
  if (!answers || answers.length === 0) {
    return {
      reportID,
      totalAnswers: 0,
      message: "No answers provided"
    };
  }

  // حفظ كل إجابة
  for (const a of answers) {
    await db.execute(
      `INSERT INTO REPORT_ANSWER (reportID, fieldID, answer)
       VALUES (?, ?, ?)`,
      [reportID, a.fieldID, a.answer]
    );
  }

  return {
    reportID,
    totalAnswers: answers.length
  };
};



export {
  getReport,
  getReportFields,
  submitReportAnswers
};

/**
 * هذا الملف لعرض التقرير، عرض الأسئلة، وحفظ إجابات الطالب
 *
 * لما يفتح الطالب التقرير:
 * - تجيه بيانات التقرير و الاسئلة من قاعدة البيانات
 *
 * وعند إرسال الإجابات:
 * - يتم حفظ إجابات الطالب داخل جدول REPORT_ANSWER
 */