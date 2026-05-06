import {
  getTemplateById,
  getTemplateFields,
  addReportField,
  updateReportField,
  deleteReportField
} from "../../models/supervisorModel/reportTemplateModel.js";

/* ================= التمبلت ================= */
export const getTemplateByIdController = async (req, res) => {
  try {
    const { templateID } = req.params;

    const data = await getTemplateById(templateID);
//اذا ماحصل التمبلت يرجع رسالة الخطا 404
    if (!data.length) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(data[0]);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching template",
      error: error.message
    });
  }
};


/* ================= حقول التمبلت ================= */

export const getTemplateFieldsController = async (req, res) => {
  try {
    const { templateID } = req.params;
//يجيب حقول التمبلت 
    const data = await getTemplateFields(templateID);

    res.json({
      templateID,
      fields: data
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching fields",
      error: error.message
    });
  }
};


// إضافة حقل
export const addFieldController = async (req, res) => {
  try {
    const { templateID, fieldLabel, fieldType, isRequired } = req.body;

    await addReportField(templateID, fieldLabel, fieldType, isRequired);

    res.json({ message: "Field added successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error adding field",
      error: error.message
    });
  }
};


// تعديل حقل
export const updateFieldController = async (req, res) => {
  try {
    const { fieldID, fieldLabel, fieldType, isRequired } = req.body;

    await updateReportField(fieldID, fieldLabel, fieldType, isRequired);

    res.json({ message: "Field updated successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error updating field",
      error: error.message
    });
  }
};


// حذف حقل
export const deleteFieldController = async (req, res) => {
  try {
    const { fieldID } = req.params;

    await deleteReportField(fieldID);

    res.json({ message: "Field deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting field",
      error: error.message
    });
  }
};