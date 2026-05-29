import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* =====================================================
   إنشاء / نشر تقرير لفترة تدريبية

   CASE_REPORT = تقرير عام منشور لفترة
   REPORT_SUBMISSION = تسليم الطالب لاحقًا
===================================================== */

export const createTrainingReport = async (
  templateID,
  periodID,
  academicSupervisorID,
  reportTitle
) => {
  const [template] = await db.execute(
    `SELECT templateID, reportTitle
     FROM TEMPLATE
     WHERE templateID = ?`,
    [templateID]
  );

  if (!template.length) {
    return {
      success: false,
      statusCode: 404,
      message: "Template not found",
    };
  }

  const [period] = await db.execute(
    `SELECT periodID
     FROM TRAINING_PERIOD
     WHERE periodID = ?`,
    [periodID]
  );

  if (!period.length) {
    return {
      success: false,
      statusCode: 404,
      message: "Training period not found",
    };
  }

  const finalReportTitle = reportTitle?.trim() || template[0].reportTitle;

  const [existingReport] = await db.execute(
    `SELECT reportID
     FROM CASE_REPORT
     WHERE periodID = ?
       AND reportTitle = ?
       AND academicSupervisorID = ?
       AND reportStatus = 'PUBLISHED'`,
    [periodID, finalReportTitle, academicSupervisorID]
  );

  if (existingReport.length) {
    return {
      success: false,
      statusCode: 409,
      message:
        "A report with this title is already published for this training period",
    };
  }

  const [result] = await db.execute(
    `INSERT INTO CASE_REPORT
     (
       templateID,
       periodID,
       academicSupervisorID,
       reportTitle,
       reportStatus
     )
     VALUES (?, ?, ?, ?, 'PUBLISHED')`,
    [templateID, periodID, academicSupervisorID, finalReportTitle]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Training report created successfully",
    reportID: result.insertId,
    reportTitle: finalReportTitle,
  };
};

/* =====================================================
   جلب الفترات التدريبية
===================================================== */

export const getTrainingPeriods = async () => {
  const [periods] = await db.execute(
    `SELECT 
       periodID,
       name,
       level,
       startDate,
       endDate,
       status
     FROM TRAINING_PERIOD
     ORDER BY startDate DESC`
  );

  return periods;
};