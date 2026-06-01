import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/**
 * Get one template by its ID and supervisor ID.
 *
 * @param {number|string} templateID - Template ID.
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Array>} Template data if found.
 */
export const getTemplateById = async (templateID, academicSupervisorID) => {
  const [rows] = await db.execute(
    `SELECT 
       templateID,
       academicSupervisorID,
       reportTitle,
       templateDate,
       reportDate,
       created_at,
       updated_at
     FROM TEMPLATE
     WHERE templateID = ?
       AND academicSupervisorID = ?`,
    [templateID, academicSupervisorID]
  );

  return rows;
};

/**
 * Create a new report template for a supervisor.
 *
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @param {string} reportTitle - Template title.
 * @returns {Promise<Object>} Insert result.
 */
export const createTemplate = async (academicSupervisorID, reportTitle) => {
  const [result] = await db.execute(
    `INSERT INTO TEMPLATE 
     (
       academicSupervisorID,
       reportTitle,
       templateDate,
       reportDate,
       created_at,
       updated_at
     )
     VALUES (?, ?, NOW(), CURDATE(), NOW(), NOW())`,
    [academicSupervisorID, reportTitle]
  );

  return result;
};

/**
 * Get all templates created by a supervisor.
 *
 * It also returns the number of fields in each template.
 *
 * @param {number|string} academicSupervisorID - Academic supervisor ID.
 * @returns {Promise<Array>} List of templates.
 */
export const getAllTemplates = async (academicSupervisorID) => {
  const [rows] = await db.execute(
    `
    SELECT 
      t.templateID,
      t.academicSupervisorID,
      t.reportTitle,
      t.templateDate,
      t.reportDate,
      t.created_at,
      t.updated_at,
      COUNT(rf.fieldID) AS fieldsCount
    FROM TEMPLATE t
    LEFT JOIN ReportField rf 
      ON t.templateID = rf.templateID
    WHERE t.academicSupervisorID = ?
    GROUP BY 
      t.templateID,
      t.academicSupervisorID,
      t.reportTitle,
      t.templateDate,
      t.reportDate,
      t.created_at,
      t.updated_at
    ORDER BY t.templateID DESC
    `,
    [academicSupervisorID]
  );

  return rows;
};

/**
 * Get all fields for a specific template.
 *
 * @param {number|string} templateID - Template ID.
 * @returns {Promise<Array>} List of template fields.
 */
export const getTemplateFields = async (templateID) => {
  const [rows] = await db.execute(
    `SELECT
       fieldID,
       templateID,
       fieldLabel,
       fieldType,
       isRequired
     FROM ReportField
     WHERE templateID = ?
     ORDER BY fieldID ASC`,
    [templateID]
  );

  return rows;
};

/**
 * Add one field to a template.
 *
 * @param {number|string} templateID - Template ID.
 * @param {string} fieldLabel - Field label.
 * @param {string} fieldType - Field type.
 * @param {number} isRequired - Shows if the field is required.
 * @returns {Promise<Object>} Insert result.
 */
export const addReportField = async (
  templateID,
  fieldLabel,
  fieldType,
  isRequired
) => {
  const [result] = await db.execute(
    `INSERT INTO ReportField 
     (
       templateID,
       fieldLabel,
       fieldType,
       isRequired
     )
     VALUES (?, ?, ?, ?)`,
    [templateID, fieldLabel, fieldType, isRequired ?? 0]
  );

  return result;
};

/**
 * Create many fields for a template.
 *
 * This function checks that the fields array is valid before saving them.
 *
 * @param {number|string} templateID - Template ID.
 * @param {Array<Object>} fields - Template fields.
 * @returns {Promise<Object>} Creation result.
 */
export const createTemplateFields = async (templateID, fields) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: "Fields are required",
    };
  }

  for (const field of fields) {
    if (
      typeof field.fieldLabel !== "string" ||
      !field.fieldLabel.trim() ||
      typeof field.fieldType !== "string" ||
      !field.fieldType.trim()
    ) {
      return {
        success: false,
        statusCode: 400,
        message: "Each field must have fieldLabel and fieldType",
      };
    }

    await db.execute(
      `INSERT INTO ReportField
       (
         templateID,
         fieldLabel,
         fieldType,
         isRequired
       )
       VALUES (?, ?, ?, ?)`,
      [
        templateID,
        field.fieldLabel.trim(),
        field.fieldType.trim(),
        field.isRequired ? 1 : 0,
      ]
    );
  }

  return {
    success: true,
    message: "Template fields created successfully",
  };
};

/**
 * Update one field in a template.
 *
 * @param {number|string} fieldID - Field ID.
 * @param {string} fieldLabel - Updated field label.
 * @param {string} fieldType - Updated field type.
 * @param {number} isRequired - Shows if the field is required.
 * @returns {Promise<Object>} Update result.
 */
export const updateReportField = async (
  fieldID,
  fieldLabel,
  fieldType,
  isRequired
) => {
  const [result] = await db.execute(
    `UPDATE ReportField 
     SET 
       fieldLabel = ?,
       fieldType = ?,
       isRequired = ?
     WHERE fieldID = ?`,
    [fieldLabel, fieldType, isRequired ?? 0, fieldID]
  );

  return result;
};

/**
 * Delete one field and its related answers.
 *
 * A transaction is used so both delete operations succeed together.
 *
 * @param {number|string} fieldID - Field ID.
 * @returns {Promise<Object>} Delete result.
 */
export const deleteReportField = async (fieldID) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM REPORT_ANSWER
       WHERE fieldID = ?`,
      [fieldID]
    );

    const [result] = await connection.execute(
      `DELETE FROM ReportField
       WHERE fieldID = ?`,
      [fieldID]
    );

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Delete a template and all related data.
 *
 * It deletes report answers, submissions, published reports,
 * fields, and finally the template itself.
 *
 * @param {number|string} templateID - Template ID.
 * @returns {Promise<Object>} Delete result.
 */
export const deleteTemplateAndFields = async (templateID) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `DELETE ra
       FROM REPORT_ANSWER ra
       JOIN REPORT_SUBMISSION rs
         ON ra.submissionID = rs.submissionID
       JOIN CASE_REPORT cr
         ON rs.reportID = cr.reportID
       WHERE cr.templateID = ?`,
      [templateID]
    );

    await connection.execute(
      `DELETE rs
       FROM REPORT_SUBMISSION rs
       JOIN CASE_REPORT cr
         ON rs.reportID = cr.reportID
       WHERE cr.templateID = ?`,
      [templateID]
    );

    await connection.execute(
      `DELETE FROM CASE_REPORT
       WHERE templateID = ?`,
      [templateID]
    );

    await connection.execute(
      `DELETE FROM ReportField
       WHERE templateID = ?`,
      [templateID]
    );

    const [result] = await connection.execute(
      `DELETE FROM TEMPLATE
       WHERE templateID = ?`,
      [templateID]
    );

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};