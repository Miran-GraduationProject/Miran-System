import {
  getReport,
  getReportAnswers,
  getAllReports,
getReportsStats
} from "../../models/supervisorModel/reportViewModel.js";

/* =================  عرض التقرير معين  ================= */

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


// ================= جلب التقارير كلها والإحصائيات =================

export const getReportsController = async (req, res) => {
  try {
    const reports = await getAllReports();
    const stats = await getReportsStats();

    res.status(200).json({
      stats,
      reports
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching reports",
      error: error.message
    });
  }
};