import {
  getReport,
  getReportAnswers
} from "../../models/supervisorModel/reportViewModel.js";

/* ================= عرض التقرير   ================= */

export const getReportController = async (req, res) => {
  try {
    const { reportID } = req.params;

    const report = await getReport(reportID);

    if (!report.length) {
      return res.status(404).json({ message: "Report not found" });
    }
    
/* ==============    عرض اجوبة الطالب في التقرير    ================= */

    const answers = await getReportAnswers(reportID);

    res.json({
      report: report[0],
      answers
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching report",
      error: error.message
    });
  }
};