import {
  createTrainingReport,
  getTrainingPeriods,
} from "../../models/supervisorModel/createReportModel.js";

import {
  createTemplate,
  createTemplateFields,
} from "../../models/supervisorModel/reportTemplateModel.js";

/**
 * Get the AcademicSupervisor ID from the logged-in user token.
 * If the ID does not exist, it returns null.
 * @param {Object} req - The request object.
 * @returns {number|string|null} The AcademicSupervisor ID or null.
 */

const getAcademicSupervisorID = (req) => {
 return req.user?.id ?? null;
};

/**
 * Create a training report.
 *
 * If templateID is provided, the report will be created using an existing template.
 * If templateID is not provided, a new template and fields will be created first,
 * then the report will be published to students.
 * @param {Object} req - Request object.
 * @param {Object} req.body - Request body.
 * @param {number|string} req.body.templateID - Existing template ID, optional.
 * @param {number|string} req.body.periodID - Training period ID.
 * @param {string} req.body.reportTitle - Report title.
 * @param {Array<Object>} req.body.fields - Report fields when creating from scratch.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const createTrainingReportController = async (req, res) => {
  try {
    const { templateID, periodID, reportTitle, fields } = req.body || {};

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!periodID) {
      return res.status(400).json({
        success: false,
        message: "Training period ID is required",
      });
    }

    if (typeof reportTitle !== "string" || !reportTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: "Report title is required",
      });
    }

    const finalReportTitle = reportTitle.trim();
    let finalTemplateID = templateID;

    if (!finalTemplateID) {
      if (!Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Fields are required when creating a report from scratch",
        });
      }

      const templateResult = await createTemplate(
        academicSupervisorID,
        finalReportTitle
      );

      finalTemplateID = templateResult.insertId;

      const fieldsResult = await createTemplateFields(
        finalTemplateID,
        fields
      );

      if (!fieldsResult.success) {
        return res
          .status(fieldsResult.statusCode || 400)
          .json(fieldsResult);
      }
    }

    const reportResult = await createTrainingReport(
      finalTemplateID,
      periodID,
      academicSupervisorID,
      finalReportTitle
    );

    if (!reportResult.success) {
      return res
        .status(reportResult.statusCode || 400)
        .json(reportResult);
    }

    return res
      .status(reportResult.statusCode || 201)
      .json(reportResult);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Template title already exists for this supervisor",
      });
    }

    console.error("Create training report controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating training report",
      error: error.message,
    });
  }
};

/**
 * Get training periods related to the logged-in supervisor.
 *
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const getTrainingPeriodsController = async (req, res) => {
  try {
    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
      });
    }

    const periods = await getTrainingPeriods(academicSupervisorID);

    return res.status(200).json({
      success: true,
      periods,
    });
  } catch (error) {
    console.error("Get training periods error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching training periods",
      error: error.message,
    });
  }
};