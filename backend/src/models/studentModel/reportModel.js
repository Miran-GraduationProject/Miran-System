import dbConnect from "../../config/dbConnect.js";
const db = dbConnect.promise();

/**
 * Get all published reports for a specific student.
 * It returns the reports related to the student's training period,
 * including submission status, approval status, and report state.
 * @param {number} studentID - Student ID.
 * @returns {Promise<Array>} List of student reports.
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

      tp.name AS periodName,
      tp.level AS periodLevel,
      tp.startDate,
      tp.endDate,

      rs.submissionID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime,

      CASE
        WHEN rs.submissionID IS NOT NULL THEN 'SUBMITTED'
        WHEN tp.endDate < CURDATE() THEN 'EXPIRED_NOT_SUBMITTED'
        ELSE 'AVAILABLE'
      END AS studentReportState

    FROM STUDENT s

    JOIN CASE_REPORT cr
      ON cr.periodID = s.periodID
      AND cr.reportStatus = 'PUBLISHED'

    JOIN TRAINING_PERIOD tp
      ON tp.periodID = cr.periodID

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

/**
 * Get one published report for a specific student.
 * The report must belong to the student's training period.
 * It also returns the submission status and approval status if available.
 * @param {number|string} reportID - Report ID.
 * @param {number} studentID - Student ID.
 * @returns {Promise<Array>} Report data if it exists.
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

      tp.name AS periodName,
      tp.level AS periodLevel,
      tp.startDate,
      tp.endDate,

      rs.submissionID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime,

      CASE
        WHEN rs.submissionID IS NOT NULL THEN 'SUBMITTED'
        WHEN tp.endDate < CURDATE() THEN 'EXPIRED_NOT_SUBMITTED'
        ELSE 'AVAILABLE'
      END AS studentReportState

    FROM CASE_REPORT cr

    JOIN STUDENT s
      ON s.periodID = cr.periodID

    JOIN TRAINING_PERIOD tp
      ON tp.periodID = cr.periodID

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

/**
 * Get all fields for a report template.
 * @param {number|string} templateID - Template ID.
 * @returns {Promise<Array>} List of report fields.
 */
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

/**
 * Get the student's answers for a submitted report.
 * If the report has not been submitted yet, it returns an empty array.
 * @param {number|string|null} submissionID - Submission ID.
 * @returns {Promise<Array>} List of answers.
 */
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

/**
 * Submit student answers for a report.
 * This function checks that the report is available for the student,
 * the training period has not ended, and the student has not submitted
 * the same report before.
 * If everything is valid, it creates a submission and saves the answers.
 *
 * @param {number|string} reportID - Report ID.
 * @param {number} studentID - Student ID.
 * @param {Array<Object>} answers - Student answers.
 * @returns {Promise<Object>} Submission result.
 */
const submitReportAnswers = async (reportID, studentID, answers) => {
  if (!answers || answers.length === 0) {
    return {
      success: false,
      statusCode: 400,
      reportID,
      totalAnswers: 0,
      message: "No answers provided",
    };
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if the report exists, is published, and belongs to the student's period
    const [reportRows] = await connection.execute(
      `
      SELECT 
        cr.reportID,
        cr.templateID,
        tp.endDate
      FROM CASE_REPORT cr
      JOIN STUDENT s
        ON s.periodID = cr.periodID
      JOIN TRAINING_PERIOD tp
        ON tp.periodID = cr.periodID
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
        statusCode: 404,
        message: "Report not found or not available for this student",
      };
    }

    const report = reportRows[0];

    // Check if the training period has ended
    const [dateCheck] = await connection.execute(
      `
      SELECT 
        CASE 
          WHEN ? < CURDATE() THEN 1
          ELSE 0
        END AS isExpired
      `,
      [report.endDate]
    );

    if (dateCheck[0].isExpired === 1) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 403,
        message: "Training period has ended. You can no longer submit this report",
      };
    }

    // Prevent submitting the same report more than once
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
        statusCode: 400,
        message: "Report already submitted",
        submissionID: existingSubmission[0].submissionID,
      };
    }

    // Create the report submission
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
      VALUES (?, ?, 'قيد المراجعة', CURDATE(), CURTIME())
      `,
      [reportID, studentID]
    );

    const submissionID = submissionResult.insertId;

    // Save all answers for this submission
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
      statusCode: 201,
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