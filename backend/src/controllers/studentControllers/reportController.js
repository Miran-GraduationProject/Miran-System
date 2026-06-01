import {
  getStudentReports,
  getReport,
  getReportFields,
  getReportAnswers,
  submitReportAnswers,
} from "../../models/studentModel/reportModel.js";


/**
 * Get the student ID from the logged-in user token.
 * If the ID does not exist, it returns null.
 * @param {Object} req - The request object.
 * @returns {number|string|null} The student ID or null.
 */

const getStudentIDFromToken = (req) => {
  return req.user?.id ?? null;
}; 


  /**
 * Get all reports for the logged-in student.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const getStudentReportsController = async (req, res) => {
  try {
    const studentID = getStudentIDFromToken(req);
    if (!studentID) {
      return res.status(401).json({
        message: "Student ID not found in token",
      });
    }

const reports = await getStudentReports(studentID);
    return res.status(200).json({
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student reports",
      error: error.message,
    });
  }
};

/**
 * Get one report for the student.
 * It returns the report details, fields, and answers if they exist.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.reportID - Report ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const getReportController = async (req, res) => {
  try {
    const { reportID } = req.params;

    const studentID = getStudentIDFromToken(req);
   
    if (!studentID) {
      return res.status(401).json({
        message: "Student ID not found in token",
      });
    }
    
    if (!reportID) {
      return res.status(400).json({
        message: "reportID is required",
      });
    }

    const report = await getReport(reportID, studentID);

    if (!report.length) {
      return res.status(404).json({
        message: "Report not found or not available for this student",
      });
    }

    const fields = await getReportFields(report[0].templateID);
    const answers = await getReportAnswers(report[0].submissionID);

    return res.status(200).json({
      report: report[0],
      fields,
      answers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching report",
      error: error.message,
    });
  }
};


/**
 * Submit student answers for a report.
 * It checks the report ID and answers before saving them.
 * @param {Object} req - Request object.
 * @param {Object} req.body - Request body.
 * @param {number|string} req.body.reportID - Report ID.
 * @param {Array<Object>} req.body.answers - Student answers.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const submitReportController = async (req, res) => {
  try {
    const { reportID, answers } = req.body;

    const studentID = getStudentIDFromToken(req);

    if (!studentID) {
      return res.status(401).json({
        message: "Student ID not found in token",
      });
    }

    if (!reportID || !answers) {
      return res.status(400).json({
        message: "reportID and answers are required",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "answers are required",
      });
    }

    const result = await submitReportAnswers(reportID, studentID, answers);

    if (result.success === false) {
      return res.status(result.statusCode || 400).json(result);
    }

    return res.status(result.statusCode || 201).json({
      message: "Report submitted successfully",
      submissionID: result.submissionID,
      reportID: result.reportID,
      totalAnswers: result.totalAnswers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting report",
      error: error.message,
    });
  }
};
