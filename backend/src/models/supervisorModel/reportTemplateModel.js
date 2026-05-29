import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* =====================================================
   TEMPLATE
   إدارة القوالب
===================================================== */

export const getTemplateById = async (templateID) => {
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
     WHERE templateID = ?`,
    [templateID]
  );

  return rows;
};

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

export const getAllTemplates = async () => {
  const [rows] = await db.execute(`
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
    GROUP BY 
      t.templateID,
      t.academicSupervisorID,
      t.reportTitle,
      t.templateDate,
      t.reportDate,
      t.created_at,
      t.updated_at
    ORDER BY t.templateID DESC
  `);

  return rows;
};

/* =====================================================
   ReportField
   إدارة حقول القالب
===================================================== */

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

/* =====================================================
   حذف القالب وكل ما يرتبط به
   يعتمد على الشكل الجديد فقط
===================================================== */

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