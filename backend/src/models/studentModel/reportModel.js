import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* ================= قائمة تقارير الطالب ================= */
/*
  تجيب كل التقارير المنشورة المرتبطة بفترة تدريب الطالب
  ومعها حالة تسليم الطالب إذا كان سلم التقرير أو لا
*/

const getStudentReports = async (studentID) => {
  const [rows] = await db.execute(
    `
    SELECT
      cr.reportID,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,
      cr.reportTitle,
      cr.reportStatus,
      cr.publishedAt,

      rs.submissionID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime

    FROM STUDENT s

    JOIN CASE_REPORT cr
      ON cr.periodID = s.periodID
      AND cr.reportStatus = 'PUBLISHED'

    LEFT JOIN REPORT_SUBMISSION rs
      ON rs.reportID = cr.reportID
      AND rs.studentID = s.studentID

    WHERE s.studentID = ?

    ORDER BY cr.publishedAt DESC, cr.reportID DESC
    `,
    [studentID]
  );

  return rows;
};

/* ================= تقرير واحد للطالب ================= */
/*
  يرجع التقرير مع حالة تسليم الطالب:
  - submissionID
  - approvalStatus
  - submissionDate
  - submissionTime
*/

const getReport = async (reportID, studentID) => {
  const [rows] = await db.execute(
    `
    SELECT
      cr.reportID,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,
      cr.reportTitle,
      cr.reportStatus,
      cr.publishedAt,

      rs.submissionID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime

    FROM CASE_REPORT cr

    JOIN STUDENT s
      ON s.periodID = cr.periodID

    LEFT JOIN REPORT_SUBMISSION rs
      ON rs.reportID = cr.reportID
      AND rs.studentID = s.studentID

    WHERE cr.reportID = ?
      AND s.studentID = ?
      AND cr.reportStatus = 'PUBLISHED'
    `,
    [reportID, studentID]
  );

  return rows;
};

/* ================= حقول التقرير ================= */

const getReportFields = async (templateID) => {
  const [rows] = await db.execute(
    `
    SELECT
      fieldID,
      templateID,
      fieldLabel,
      fieldType,
      isRequired
    FROM ReportField
    WHERE templateID = ?
    ORDER BY fieldID ASC
    `,
    [templateID]
  );

  return rows;
};

/* ================= إجابات الطالب بعد التسليم ================= */

const getReportAnswers = async (submissionID) => {
  if (!submissionID) return [];

  const [rows] = await db.execute(
    `
    SELECT
      answerID,
      submissionID,
      fieldID,
      answer
    FROM REPORT_ANSWER
    WHERE submissionID = ?
    `,
    [submissionID]
  );

  return rows;
};

/* ================= حفظ إجابات الطالب ================= */
/*
  النظام:
  - CASE_REPORT = التقرير المنشور
  - REPORT_SUBMISSION = تسليم الطالب
  - REPORT_ANSWER = إجابات الطالب
*/

const submitReportAnswers = async (reportID, studentID, answers) => {
  if (!answers || answers.length === 0) {
    return {
      reportID,
      totalAnswers: 0,
      message: "No answers provided",
    };
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // التأكد أن التقرير موجود ومنشور ومتاح لطالب في نفس الفترة
    const [reportRows] = await connection.execute(
      `
      SELECT cr.reportID, cr.templateID
      FROM CASE_REPORT cr
      JOIN STUDENT s
        ON s.periodID = cr.periodID
      WHERE cr.reportID = ?
        AND s.studentID = ?
        AND cr.reportStatus = 'PUBLISHED'
      `,
      [reportID, studentID]
    );

    if (!reportRows.length) {
      await connection.rollback();

      return {
        success: false,
        message: "Report not found or not available for this student",
      };
    }

    // منع الطالب من تسليم نفس التقرير مرتين
    const [existingSubmission] = await connection.execute(
      `
      SELECT submissionID
      FROM REPORT_SUBMISSION
      WHERE reportID = ?
        AND studentID = ?
      `,
      [reportID, studentID]
    );

    if (existingSubmission.length) {
      await connection.rollback();

      return {
        success: false,
        message: "Report already submitted",
        submissionID: existingSubmission[0].submissionID,
      };
    }

    // إنشاء تسليم الطالب
    const [submissionResult] = await connection.execute(
      `
      INSERT INTO REPORT_SUBMISSION
      (
        reportID,
        studentID,
        approvalStatus,
        submissionDate,
        submissionTime
      )
      VALUES (?, ?, 'PENDING', CURDATE(), CURTIME())
      `,
      [reportID, studentID]
    );

    const submissionID = submissionResult.insertId;

    // حفظ الإجابات
    for (const a of answers) {
      await connection.execute(
        `
        INSERT INTO REPORT_ANSWER
        (
          submissionID,
          fieldID,
          answer
        )
        VALUES (?, ?, ?)
        `,
        [submissionID, a.fieldID, a.answer]
      );
    }

    await connection.commit();

    return {
      success: true,
      message: "Report submitted successfully",
      reportID,
      submissionID,
      totalAnswers: answers.length,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export {
  getStudentReports,
  getReport,
  getReportFields,
  getReportAnswers,
  submitReportAnswers,
};