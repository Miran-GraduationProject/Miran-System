import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  getTemplateFields,
  addReportField,
  updateReportField,
  deleteReportField,
  deleteTemplateAndFields,
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
 * Get all templates for the logged-in supervisor.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const getAllTemplatesController = async (req, res) => {
  try {
    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    const templates = await getAllTemplates(academicSupervisorID);

    return res.status(200).json(templates);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching templates",
      error: error.message,
    });
  }
};

/**
 * Create a new report template for the supervisor.
 * It checks the supervisor ID and report title before saving the template.
 * @param {Object} req - Request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.reportTitle - Template title.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const createTemplateController = async (req, res) => {
  try {
    const { reportTitle } = req.body || {};

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    if (typeof reportTitle !== "string" || !reportTitle.trim()) {
      return res.status(400).json({
        message: "reportTitle is required",
      });
    }

    const result = await createTemplate(
      academicSupervisorID,
      reportTitle.trim()
    );

    return res.status(201).json({
      message: "Template created successfully",
      templateID: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Template title already exists for this supervisor",
      });
    }

    return res.status(500).json({
      message: "Error creating template",
      error: error.message,
    });
  }
};

/**
 * Get one template by its ID.
 * The template must belong to the logged-in supervisor.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.templateID - Template ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */
export const getTemplateByIdController = async (req, res) => {
  try {
    const { templateID } = req.params;

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
      });
    }

    const template = await getTemplateById(templateID, academicSupervisorID);

    if (!template.length) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    return res.status(200).json(template[0]);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching template",
      error: error.message,
    });
  }
};

/**
 * Get all fields for a specific template.
 * The function first checks that the template belongs to the logged-in supervisor.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.templateID - Template ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const getTemplateFieldsController = async (req, res) => {
  try {
    const { templateID } = req.params;

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
      });
    }

    const template = await getTemplateById(templateID, academicSupervisorID);

    if (!template.length) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    const fields = await getTemplateFields(templateID);

    return res.status(200).json({
      templateID,
      fields,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching fields",
      error: error.message,
    });
  }
};

/**
 * Add a new field to a template.
 * It checks the template ID, field label, and field type before adding the field.
 * @param {Object} req - Request object.
 * @param {Object} req.body - Request body.
 * @param {number|string} req.body.templateID - Template ID.
 * @param {string} req.body.fieldLabel - Field label.
 * @param {string} req.body.fieldType - Field type.
 * @param {number} req.body.isRequired - Shows if the field is required.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */
export const addFieldController = async (req, res) => {
  try {
    const { templateID, fieldLabel, fieldType, isRequired } = req.body || {};

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
      });
    }

    if (typeof fieldLabel !== "string" || !fieldLabel.trim()) {
      return res.status(400).json({
        message: "fieldLabel is required",
      });
    }

    if (typeof fieldType !== "string" || !fieldType.trim()) {
      return res.status(400).json({
        message: "fieldType is required",
      });
    }

    const template = await getTemplateById(templateID, academicSupervisorID);

    if (!template.length) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    const result = await addReportField(
      templateID,
      fieldLabel.trim(),
      fieldType.trim(),
      isRequired ?? 0
    );

    return res.status(201).json({
      message: "Field added successfully",
      fieldID: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error adding field",
      error: error.message,
    });
  }
};
/**
 * Update an existing field in a template.
 * The function checks that the template belongs to the logged-in supervisor
 * before updating the field.
 * @param {Object} req - Request object.
 * @param {Object} req.body - Request body.
 * @param {number|string} req.body.fieldID - Field ID.
 * @param {number|string} req.body.templateID - Template ID.
 * @param {string} req.body.fieldLabel - Updated field label.
 * @param {string} req.body.fieldType - Updated field type.
 * @param {number} req.body.isRequired - Shows if the field is required.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const updateFieldController = async (req, res) => {
  try {
    const { fieldID, templateID, fieldLabel, fieldType, isRequired } =
      req.body || {};

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
      });
    }

    if (!fieldID) {
      return res.status(400).json({
        message: "fieldID is required",
      });
    }

    if (typeof fieldLabel !== "string" || !fieldLabel.trim()) {
      return res.status(400).json({
        message: "fieldLabel is required",
      });
    }

    if (typeof fieldType !== "string" || !fieldType.trim()) {
      return res.status(400).json({
        message: "fieldType is required",
      });
    }

    const template = await getTemplateById(templateID, academicSupervisorID);

    if (!template.length) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    const result = await updateReportField(
      fieldID,
      fieldLabel.trim(),
      fieldType.trim(),
      isRequired ?? 0
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Field not found",
      });
    }

    return res.status(200).json({
      message: "Field updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating field",
      error: error.message,
    });
  }
};
 
/**
 * Delete a field from a template.
 * The function checks that the template belongs to the logged-in supervisor
 * before deleting the field.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.fieldID - Field ID.
 * @param {Object} req.body - Request body.
 * @param {number|string} req.body.templateID - Template ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */
export const deleteFieldController = async (req, res) => {
  try {
    const { fieldID } = req.params;
    const { templateID } = req.body || {};

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
      });
    }

    if (!fieldID) {
      return res.status(400).json({
        message: "fieldID is required",
      });
    }

    const template = await getTemplateById(templateID, academicSupervisorID);

    if (!template.length) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    const result = await deleteReportField(fieldID);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Field not found",
      });
    }

    return res.status(200).json({
      message: "Field deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting field",
      error: error.message,
    });
  }
};
/**
 * Delete a template and its related data.
 * The function checks that the template belongs to the logged-in supervisor
 * before deleting it.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.templateID - Template ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */
export const deleteTemplateController = async (req, res) => {
  try {
    const { templateID } = req.params;

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
      });
    }
    
    const template = await getTemplateById(templateID, academicSupervisorID);

    if (!template.length) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    const result = await deleteTemplateAndFields(templateID);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    return res.status(200).json({
      message: "Template and its related data deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting template",
      error: error.message,
    });
  }
};