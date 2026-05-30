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

/**
 * Create and publish a training report for a training period.
 *
 * This function checks that:
 * - The supervisor has a selected hospital.
 * - The template belongs to the same supervisor.
 * - The training period exists.
 * - The period has students from the supervisor's hospital.
 * - The same report title is not already published for the same period.
 *
 * @param {number|string} templateID - Template ID.
 * @param {number|string} periodID - Training period ID.
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @param {string} reportTitle - Report title.
 * @returns {Promise<Object>} Created report result.
 */
export const createTrainingReport = async (
  templateID,
  periodID,
  academicSupervisorID,
  reportTitle
) => {
  const supervisorHospital = await getSupervisorHospital(academicSupervisorID);

  if (!supervisorHospital) {
    return {
      success: false,
      statusCode: 403,
      message: "Supervisor hospital not found",
    };
  }

  // Check if the template belongs to the same supervisor
  const [template] = await db.execute(
    `
    SELECT 
      templateID,
      reportTitle,
      academicSupervisorID
    FROM TEMPLATE
    WHERE templateID = ?
      AND academicSupervisorID = ?
    `,
    [templateID, academicSupervisorID]
  );

  if (!template.length) {
    return {
      success: false,
      statusCode: 404,
      message: "Template not found or does not belong to this supervisor",
    };
  }

  // Check if the training period exists
  const [period] = await db.execute(
    `
    SELECT 
      periodID,
      name,
      level,
      startDate,
      endDate,
      status
    FROM TRAINING_PERIOD
    WHERE periodID = ?
    `,
    [periodID]
  );

  if (!period.length) {
    return {
      success: false,
      statusCode: 404,
      message: "Training period not found",
    };
  }

  // Check if this period has students from the supervisor hospital
  const [allowedPeriod] = await db.execute(
    `
    SELECT DISTINCT tp.periodID
    FROM TRAINING_PERIOD tp
    JOIN STUDENT s
      ON s.periodID = tp.periodID
    JOIN \`User\` u
      ON u.userID = s.studentID
    WHERE tp.periodID = ?
      AND u.selectedHospital = ?
    LIMIT 1
    `,
    [periodID, supervisorHospital]
  );

  if (!allowedPeriod.length) {
    return {
      success: false,
      statusCode: 403,
      message: "You cannot publish a report for this training period",
    };
  }

  const finalReportTitle = reportTitle?.trim() || template[0].reportTitle;

  // Prevent publishing the same report title for the same period
  const [existingReport] = await db.execute(
    `
    SELECT reportID
    FROM CASE_REPORT
    WHERE periodID = ?
      AND reportTitle = ?
      AND academicSupervisorID = ?
      AND reportStatus = 'PUBLISHED'
    `,
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

  // Publish the report in CASE_REPORT
  const [result] = await db.execute(
    `
    INSERT INTO CASE_REPORT
    (
      templateID,
      periodID,
      academicSupervisorID,
      reportTitle,
      reportStatus
    )
    VALUES (?, ?, ?, ?, 'PUBLISHED')
    `,
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

/**
 * Get training periods related to the supervisor hospital.
 *
 * It returns only the periods that have students from the same hospital
 * selected by the supervisor.
 *
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Array>} List of training periods.
 */
export const getTrainingPeriods = async (academicSupervisorID) => {
  const supervisorHospital = await getSupervisorHospital(academicSupervisorID);

  if (!supervisorHospital) {
    return [];
  }

  const [periods] = await db.execute(
    `
    SELECT DISTINCT
      tp.periodID,
      tp.name,
      tp.level,
      tp.startDate,
      tp.endDate,
      tp.status
    FROM TRAINING_PERIOD tp
    JOIN STUDENT s
      ON s.periodID = tp.periodID
    JOIN \`User\` u
      ON u.userID = s.studentID
    WHERE u.selectedHospital = ?
    ORDER BY tp.startDate DESC
    `,
    [supervisorHospital]
  );

  return periods;
};