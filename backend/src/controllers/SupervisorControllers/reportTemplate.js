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

/* =====================================================
   TEMPLATE CONTROLLER
===================================================== */

export const getAllTemplatesController = async (req, res) => {
  try {
    const templates = await getAllTemplates();

    return res.status(200).json(templates);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching templates",
      error: error.message,
    });
  }
};

export const createTemplateController = async (req, res) => {
  try {
    const { reportTitle } = req.body || {};

    const academicSupervisorID =
      req.user?.id || req.user?.userID || req.user?.academicSupervisorID;

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

export const getTemplateByIdController = async (req, res) => {
  try {
    const { templateID } = req.params;

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
      });
    }

    const template = await getTemplateById(templateID);

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

/* =====================================================
   ReportField CONTROLLER
===================================================== */

export const getTemplateFieldsController = async (req, res) => {
  try {
    const { templateID } = req.params;

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
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

export const addFieldController = async (req, res) => {
  try {
    const { templateID, fieldLabel, fieldType, isRequired } = req.body || {};

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

export const updateFieldController = async (req, res) => {
  try {
    const { fieldID, fieldLabel, fieldType, isRequired } = req.body || {};

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

export const deleteFieldController = async (req, res) => {
  try {
    const { fieldID } = req.params;

    if (!fieldID) {
      return res.status(400).json({
        message: "fieldID is required",
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

export const deleteTemplateController = async (req, res) => {
  try {
    const { templateID } = req.params;

    if (!templateID) {
      return res.status(400).json({
        message: "templateID is required",
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