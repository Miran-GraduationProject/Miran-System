import db from "../../config/dbConnect.js";

export const getStudentCases = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?.userID || req.user?.studentID;

    if (!studentId) {
      return res.status(401).json({
        message: "Student ID not found in token",
      });
    }

    // جلب الحالات الإلزامية
    const [cases] = await db.promise().query(
      `
      SELECT
        caseID,
        caseName,
        notes,
        templateID
      FROM Mandatory_Cases
      `
    );

    if (cases.length === 0) {
      return res.status(200).json({
        message: "No cases found",
        data: [],
      });
    }

    // جلب تقارير الطالب المرتبطة بالتسليمات
    const [reports] = await db.promise().query(
      `
      SELECT 
        cr.templateID,
        rs.approvalStatus,
        rs.submissionID
      FROM REPORT_SUBMISSION rs
      JOIN CASE_REPORT cr
        ON rs.reportID = cr.reportID
      WHERE rs.studentID = ?
        AND cr.reportStatus = 'PUBLISHED'
      `,
      [studentId]
    );

    // دمج الحالات مع تقارير الطالب
    const result = cases.map((c) => {
      const report = reports.find(
        (r) => Number(r.templateID) === Number(c.templateID)
      );

      let status = "pending";

      if (report) {
        if (report.approvalStatus === "APPROVED") {
          status = "accepted";
        } else {
          status = "completed";
        }
      }

      return {
        caseID: c.caseID,
        caseName: c.caseName,
        notes: c.notes,
        templateID: c.templateID,
        status,
      };
    });

    return res.status(200).json({
      message: "Cases retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get Student Cases Error:", error);

    return res.status(500).json({
      message: "Error fetching cases",
    });
  }
};