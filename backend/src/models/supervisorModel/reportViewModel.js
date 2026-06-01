import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/**
 * Get the supervisor hospital from the User table.
 *
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<string|null>} Supervisor hospital or null.
 */
const getSupervisorHospital = async (academicSupervisorID) => {
  const [rows] = await db.execute(
    `
    SELECT selectedHospital
    FROM \`User\`
    WHERE userID = ?
    LIMIT 1
    `,
    [academicSupervisorID]
  );

  return rows[0]?.selectedHospital || null;
};

const getSupervisorHospitalId = async (academicSupervisorID) => {
  const [rows] = await db.execute(
    `
    SELECT hospitalID
    FROM HOSPITAL
    WHERE supervisorID = ?
    LIMIT 1
    `,
    [academicSupervisorID]
  );

  return rows[0]?.hospitalID || null;
};

/**
 * Get one published report for the supervisor.
 *
 * It returns the report details with its template fields.
 *
 * @param {number|string} reportID - Report ID.
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Object|null>} Report data with fields, or null if not found.
 */
export const getReport = async (reportID, academicSupervisorID) => {
  const supervisorHospital = await getSupervisorHospital(academicSupervisorID);

  if (!supervisorHospital) return null;

  const [reportRows] = await db.execute(
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

      t.reportTitle AS templateTitle

    FROM CASE_REPORT cr

    LEFT JOIN TRAINING_PERIOD tp
      ON cr.periodID = tp.periodID

    LEFT JOIN TEMPLATE t
      ON cr.templateID = t.templateID

    WHERE cr.reportID = ?
      AND cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'
    `,
    [reportID, academicSupervisorID]
  );

  if (!reportRows.length) {
    return null;
  }

  const report = reportRows[0];

  const [fields] = await db.execute(
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
    [report.templateID]
  );

  return {
    ...report,
    fields,
  };
};

/**
 * Get all published reports created by the supervisor.
 *
 * It returns each report with the total students and submitted students.
 *
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Array>} List of reports.
 */
export const getAllReports = async (academicSupervisorID) => {
  const supervisorHospitalId = await getSupervisorHospitalId(
    academicSupervisorID
  );

  if (!supervisorHospitalId) return [];

  const [rows] = await db.execute(
    `
    SELECT
      cr.reportID,
      cr.reportTitle,
      cr.reportStatus,
      cr.publishedAt,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,

      tp.name AS periodName,
      tp.level AS periodLevel,
      tp.startDate,
      tp.endDate,

      COUNT(DISTINCT s.studentID) AS totalStudents,
      COUNT(DISTINCT rs.submissionID) AS submittedStudents

    FROM CASE_REPORT cr

    JOIN TRAINING_PERIOD tp
      ON cr.periodID = tp.periodID

    JOIN TRAINING_OPPORTUNITY op
      ON op.periodID = cr.periodID
      AND op.hospitalID = ?

    JOIN STUDENT_ENROLLMENT en
      ON en.opportunityID = op.opportunityID
      AND en.periodID = cr.periodID

    JOIN STUDENT s
      ON s.studentID = en.studentID

    JOIN \`User\` u
      ON u.userID = s.studentID

    LEFT JOIN REPORT_SUBMISSION rs
      ON rs.reportID = cr.reportID
      AND rs.studentID = s.studentID

    WHERE cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'

    GROUP BY
      cr.reportID,
      cr.reportTitle,
      cr.reportStatus,
      cr.publishedAt,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,
      tp.name,
      tp.level,
      tp.startDate,
      tp.endDate

    ORDER BY cr.publishedAt DESC, cr.reportID DESC
    `,
    [supervisorHospitalId, academicSupervisorID]
  );

  return rows;
};

/**
 * Get report statistics for the supervisor.
 *
 * It returns total reports, pending reports, review reports,
 * and completed reports.
 *
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Object>} Report statistics.
 */
export const getReportsStats = async (academicSupervisorID) => {
  const supervisorHospital = await getSupervisorHospital(academicSupervisorID);

  if (!supervisorHospital) {
    return {
      totalReports: 0,
      pendingReports: 0,
      reviewReports: 0,
      completedReports: 0,
    };
  }

  const [rows] = await db.execute(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM CASE_REPORT
        WHERE academicSupervisorID = ?
          AND reportStatus = 'PUBLISHED'
      ) AS totalReports,

      (
        SELECT COUNT(*)
        FROM REPORT_SUBMISSION rs
        JOIN CASE_REPORT cr
          ON rs.reportID = cr.reportID
        JOIN \`User\` u
          ON u.userID = rs.studentID
        WHERE cr.academicSupervisorID = ?
          AND cr.reportStatus = 'PUBLISHED'
          AND rs.approvalStatus = 'قيد المراجعة'
          AND u.selectedHospital = ?
      ) AS pendingReports,

      (
        SELECT COUNT(*)
        FROM REPORT_SUBMISSION rs
        JOIN CASE_REPORT cr
          ON rs.reportID = cr.reportID
        JOIN \`User\` u
          ON u.userID = rs.studentID
        WHERE cr.academicSupervisorID = ?
          AND cr.reportStatus = 'PUBLISHED'
          AND rs.approvalStatus = 'قيد المراجعة'
          AND u.selectedHospital = ?
      ) AS reviewReports,

      (
        SELECT COUNT(*)
        FROM REPORT_SUBMISSION rs
        JOIN CASE_REPORT cr
          ON rs.reportID = cr.reportID
        JOIN \`User\` u
          ON u.userID = rs.studentID
        WHERE cr.academicSupervisorID = ?
          AND cr.reportStatus = 'PUBLISHED'
          AND rs.approvalStatus = 'قبول'
          AND u.selectedHospital = ?
      ) AS completedReports
    `,
    [
      academicSupervisorID,
      academicSupervisorID,
      supervisorHospital,
      academicSupervisorID,
      supervisorHospital,
      academicSupervisorID,
      supervisorHospital,
    ]
  );

  return rows[0];
};

/**
 * Get all students related to one report.
 *
 * It shows each student with their submission status.
 *
 * @param {number|string} reportID - Report ID.
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Array>} List of students with submission status.
 */
export const getReportStudentsForSupervisor = async (
  reportID,
  academicSupervisorID
) => {
  const supervisorHospitalId = await getSupervisorHospitalId(
    academicSupervisorID
  );

  if (!supervisorHospitalId) return [];

  const [rows] = await db.execute(
    `
    SELECT
      cr.reportID,
      cr.reportTitle,
      cr.periodID,

      s.studentID,
      u.firstName,
      u.secondName,
      u.lastName,
      u.email,

      rs.submissionID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime,
      rs.approvedAt,

      CASE
        WHEN rs.submissionID IS NULL THEN 'NOT_SUBMITTED'
        ELSE 'SUBMITTED'
      END AS submissionStatus

    FROM CASE_REPORT cr

    JOIN TRAINING_OPPORTUNITY op
      ON op.periodID = cr.periodID
      AND op.hospitalID = ?

    JOIN STUDENT_ENROLLMENT en
      ON en.opportunityID = op.opportunityID
      AND en.periodID = cr.periodID

    JOIN STUDENT s
      ON s.studentID = en.studentID

    JOIN \`User\` u
      ON u.userID = s.studentID

    LEFT JOIN REPORT_SUBMISSION rs
      ON rs.reportID = cr.reportID
      AND rs.studentID = s.studentID

    WHERE cr.reportID = ?
      AND cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'

    ORDER BY u.firstName ASC, u.lastName ASC
    `,
    [supervisorHospitalId, reportID, academicSupervisorID]
  );

  return rows;
};

/**
 * Get the answers of one student submission.
 *
 * It checks that the submission belongs to a report created by
 * the same supervisor and hospital.
 *
 * @param {number|string} submissionID - Submission ID.
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Object|null>} Submission data with answers, or null if not found.
 */
export const getSubmissionAnswersForSupervisor = async (
  submissionID,
  academicSupervisorID
) => {
  const supervisorHospital = await getSupervisorHospital(academicSupervisorID);

  if (!supervisorHospital) return null;

  const [submissionRows] = await db.execute(
    `
    SELECT
      rs.submissionID,
      rs.reportID,
      rs.studentID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime,
      rs.approvedBy,
      rs.approvedAt,

      cr.reportTitle,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,

      u.firstName,
      u.secondName,
      u.lastName,
      u.email

    FROM REPORT_SUBMISSION rs

    JOIN CASE_REPORT cr
      ON rs.reportID = cr.reportID

    JOIN \`User\` u
      ON rs.studentID = u.userID

    WHERE rs.submissionID = ?
      AND cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'
      AND u.selectedHospital = ?
    `,
    [submissionID, academicSupervisorID, supervisorHospital]
  );

  if (!submissionRows.length) {
    return null;
  }

  const [answers] = await db.execute(
    `
    SELECT
      ra.answerID,
      ra.fieldID,
      ra.answer,

      rf.fieldLabel,
      rf.fieldType,
      rf.isRequired

    FROM REPORT_ANSWER ra

    JOIN ReportField rf
      ON ra.fieldID = rf.fieldID

    WHERE ra.submissionID = ?

    ORDER BY rf.fieldID ASC
    `,
    [submissionID]
  );

  return {
    ...submissionRows[0],
    answers,
  };
};

/**
 * Approve a student's report submission.
 *
 * The approval is allowed only if the submission belongs to
 * a report created by the same supervisor and hospital.
 *
 * @param {number|string} submissionID - Submission ID.
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Object>} Update result.
 */
export const approveSubmission = async (
  submissionID,
  academicSupervisorID
) => {
  const supervisorHospital = await getSupervisorHospital(academicSupervisorID);

  if (!supervisorHospital) {
    return {
      affectedRows: 0,
    };
  }

  const [result] = await db.execute(
    `
    UPDATE REPORT_SUBMISSION rs

    JOIN CASE_REPORT cr
      ON rs.reportID = cr.reportID

    JOIN \`User\` u
      ON u.userID = rs.studentID

    SET
      rs.approvalStatus = 'قبول',
      rs.approvedBy = ?,
      rs.approvedAt = NOW()

    WHERE rs.submissionID = ?
      AND cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'
      AND u.selectedHospital = ?
    `,
    [academicSupervisorID, submissionID, academicSupervisorID, supervisorHospital]
  );

  return result;
};
