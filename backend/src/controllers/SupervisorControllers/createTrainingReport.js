import { createTrainingReport } from "../../models/supervisorModel/createReportModel.js";

/* ================= انشاء تقارير تدريب للطلاب ================= */

export const createTrainingReportController = async (req, res) => {
  try {
    // يجيب التمبلت والفترة التدريبية اللي دخلها المشرف
    const { templateID, periodID } = req.body;
    // يتحقق من البيانات اذا موجودة 
    if (!templateID || !periodID) {
      return res.status(400).json({
        message: "templateID and periodID are required"
      });
    }

    // استدعاء المودل لانشاء التقرير في قاعدة البيانات
    const result = await createTrainingReport(templateID, periodID);

    // رسائل الخطا من المودل
    if (result.message === "No students found in this period" ||
        result.message === "Template not found") {
      return res.status(404).json(result);
    }

    // اذا تمت العملية 
    res.json(result);
    
    // اذا صار ايرور مو متوقع 
  } catch (error) {
    res.status(500).json({
      message: "Error creating training reports",
      error: error.message
    });
  }
};