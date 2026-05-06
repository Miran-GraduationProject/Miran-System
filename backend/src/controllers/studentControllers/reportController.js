import {
  getReport,
  getReportFields,
  submitReportAnswers
} from "../../models/studentModel/reportModel.js";

/* ================= يعرض التقرير لطالب ================= */
export const getReportController = async (req, res) => {
  try {
    const { reportID } = req.params;

    // 1. يجيب التقرير من قاعدة البيانات
    const report = await getReport(reportID);

    // 2. في حال ماحصل التقرير
    if (!report.length) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    // 3. يجيب الأسئلةالمرتبطة بالتمبلت
    const fields = await getReportFields(report[0].templateID);

    // 4. يرسلها لطالب
    res.json({
      report: report[0],
      fields
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching report",
      error: error.message
    });
  }
};


/* ================= حفظ اجابات الطالب ================= */
export const submitReportController = async (req, res) => {
  try {
    const { reportID, answers } = req.body;

    // 1. التحقق من البيانات الأساسية
    if (!reportID || !answers) {
      return res.status(400).json({
        message: "reportID and answers are required"
      });
    }

    // 2. حفظ الإجابات في قاعدة البيانات
    await submitReportAnswers(reportID, answers);

    // 3. رسالة اتمام العملية
    res.json({
      message: "Report submitted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error submitting report",
      error: error.message
    });
  }
};