 import {
  createTrainingReport,
  getTrainingPeriods,
} from "../../models/supervisorModel/createReportModel.js";

import {
  createTemplate,
  createTemplateFields,
} from "../../models/supervisorModel/reportTemplateModel.js";

/* =====================================================
   إنشاء / نشر تقرير تدريبي

   الحالة 1:
   استخدام قالب محفوظ:
   - يصل templateID من الفرونت
   - يتم نشر التقرير مباشرة في CASE_REPORT

   الحالة 2:
   إنشاء من الصفر:
   - لا يصل templateID
   - تصل fields من الفرونت
   - يتم إنشاء TEMPLATE
   - يتم إنشاء ReportField
   - يتم نشر التقرير في CASE_REPORT
===================================================== */

export const createTrainingReportController = async (req, res) => {
  try {
    const { templateID, periodID, reportTitle, fields } = req.body || {};

    const academicSupervisorID =
      req.user?.id || req.user?.userID || req.user?.academicSupervisorID;

    if (!periodID) {
      return res.status(400).json({
        success: false,
        message: "Training period ID is required",
      });
    }

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
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

/* =====================================================
   جلب الفترات التدريبية
===================================================== */

export const getTrainingPeriodsController = async (req, res) => {
  try {
    const periods = await getTrainingPeriods();

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