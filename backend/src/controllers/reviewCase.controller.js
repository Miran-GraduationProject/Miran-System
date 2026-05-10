// reviewCase.controller.js

import db from "../config/dbConnect.js";


// GET: جلب كل تقارير طالب حسب الرقم الجامعي

export const getReportsByStudentId = (req, res) => {
  const { studentId } = req.params; // ✅ تعريف المتغير أول شيء

  const query = `
    SELECT * FROM CASE_REPORT
    WHERE studentID = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({
        message: "Database error while fetching student reports"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "No reports found for this student"
      });
    }

    return res.status(200).json({
      message: "Student reports retrieved successfully",
      data: results
    });
  });
};



export const updateReportStatus = (req, res) => {
  return res.status(200).json({
    message: "Update report status function is disabled for now."
  });
};

// ================================
// GET: جلب تقرير واحد حسب reportID
// ================================
export const getReportById = (req, res) => {
  const { reportId } = req.params; // ✅ تعريف المتغير أول شيء
  console.log("Fetching report by ID:", reportId);

  const query = `
    SELECT * FROM CASE_REPORT
    WHERE reportID = ?
  `;

  db.query(query, [reportId], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({
        message: "Database error while fetching case report"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    return res.status(200).json({
      message: "Case report retrieved successfully",
      data: results[0]
    });
  });
};



