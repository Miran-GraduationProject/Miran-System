import { 
  getReportsByStudentIdModel,
  getReportByIdModel
} from "../models/reviewCase.js";

export const getReportsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await getReportsByStudentIdModel(studentId);

    if (results.length === 0) {
      return res.status(404).json({ message: "No reports found for this student" });
    }

    return res.status(200).json({
      message: "Student reports retrieved successfully",
      data: results
    });

  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({
      message: "Database error while fetching student reports"
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const results = await getReportByIdModel(reportId);

    if (results.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({
      message: "Case report retrieved successfully",
      data: results[0]
    });

  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({
      message: "Database error while fetching case report"
    });
  }
};

export const getFullReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    //  جلب التقرير الأساسي
    const [report] = await db.query(
      "SELECT * FROM CASE_REPORT WHERE reportID = ?",
      [reportId]
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    //  جلب الحقول الخاصة بالنموذج
    const fields = await db.query(
      "SELECT * FROM ReportField WHERE templateID = ?",
      [report.templateID]
    );

    //  جلب الإجابات الخاصة بالتقرير
    const answers = await db.query(
      "SELECT * FROM REPORT_ANSWER WHERE submissionID = ?",
      [report.reportID] // أو report.submissionID إذا عندك عمود خاص
    );

    // دمج الكل في رد واحد
    return res.json({
      report,
      fields,
      answers,
    });
  } catch (error) {
    console.error("Error fetching full report:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
