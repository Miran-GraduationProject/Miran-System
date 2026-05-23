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