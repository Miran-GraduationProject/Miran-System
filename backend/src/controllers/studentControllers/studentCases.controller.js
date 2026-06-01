import db from "../../config/dbConnect.js";

/**
 * Get all mandatory cases assigned to the logged-in student,
 * merged with the student's submission status for each case.
 *
 * Fetches all cases from Mandatory_Cases, then fetches published
 * CASE_REPORT entries linked to the student's period along with any
 * existing REPORT_SUBMISSION. Merges the two lists by templateID to
 * determine the submission status of each case.
 *
 * @route  GET /api/student/cases  (mounted via studentRoutes)
 * @access Student
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {Object} 200 - { message, data: CaseWithStatus[] }
 *
 * @typedef  {Object} CaseWithStatus
 * @property {number}  caseID           - Mandatory case ID.
 * @property {string}  caseName         - Name of the case.
 * @property {string}  description_text - Case description.
 * @property {string|null} notes        - Optional notes.
 * @property {number}  templateID       - Linked report template ID.
 * @property {number|null} reportID     - Published report ID if available.
 * @property {boolean} submitted        - Whether the student has submitted.
 * @property {string}  startDate        - Submission window start date.
 * @property {string}  endDate          - Submission window end date.
 * @property {string}  status           - "pending" | "accepted" | "rejected" | "needs revision".
 */
export const getStudentCases = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?.userID || req.user?.studentID;

    if (!studentId) {
      return res.status(401).json({
        message: "Student ID not found in token",
      });
    }

    const cases = await new Promise((resolve, reject) =>
      db.query(
        "SELECT caseID, caseName, description_text, notes, templateID, startDate, endDate FROM Mandatory_Cases",
        (err, rows) => (err ? reject(err) : resolve(rows))
      )
    );

    if (cases.length === 0) {
      return res.status(200).json({ message: "No cases found", data: [] });
    }

    const reports = await new Promise((resolve, reject) =>
      db.query(
        `SELECT cr.reportID, cr.templateID, rs.approvalStatus
         FROM CASE_REPORT cr
         JOIN STUDENT s ON s.periodID = cr.periodID
         LEFT JOIN REPORT_SUBMISSION rs
           ON rs.reportID = cr.reportID
           AND rs.studentID = s.studentID
         WHERE s.studentID = ? AND cr.reportStatus = 'PUBLISHED'`,
        [studentId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      )
    );

    const result = cases.map((c) => {
      const report = reports.find(
        (r) => Number(r.templateID) === Number(c.templateID)
      );

      let status = "pending";

      if (report) {
        if (report.approvalStatus === "قبول") {
          status = "accepted";
        } else if (report.approvalStatus === "رفض") {
          status = "rejected";
        } else if (report.approvalStatus === "يحتاج تعديل") {
          status = "needs revision";
        } else if (report.approvalStatus === "قيد المراجعة" || report.approvalStatus === null) {
          status = "pending";
        }
      }

      return {
        caseID: c.caseID,
        caseName: c.caseName,
        description_text: c.description_text,
        notes: c.notes,
        templateID: c.templateID,
        reportID: report?.reportID ?? null,
        submitted: report ? report.approvalStatus !== null : false,
        startDate: c.startDate,
        endDate: c.endDate,
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