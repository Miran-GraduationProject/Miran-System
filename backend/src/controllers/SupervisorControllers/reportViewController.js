import {
  getReport,
  getAllReports,
  getReportsStats,
  getReportStudentsForSupervisor,
  getSubmissionAnswersForSupervisor,
  approveSubmission,
} from "../../models/supervisorModel/reportViewModel.js";


/**
 * Get the AcademicSupervisor ID from the logged-in user token.
 * If the ID does not exist, it returns null.
 * @param {Object} req - The request object.
 * @returns {number|string|null} The AcademicSupervisor ID or null.
 */

const getAcademicSupervisorID = (req) => {
 return req.user?.id ?? null;
};
/**
 * Get one report for the logged-in supervisor.
 * This function returns the report details if the report belongs
 * to the current supervisor.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.reportID - Report ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const getReportController = async (req, res) => {
  try {
    const { reportID } = req.params;

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!reportID) {
      return res.status(400).json({
        success: false,
        message: "reportID is required",
      });
    }

    const report = await getReport(reportID, academicSupervisorID);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error.message,
    });
  }
};

/**
 * Get all reports created by the logged-in supervisor.
 * It returns the reports list with report statistics.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */
export const getReportsController = async (req, res) => {
  try {
    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
      });
    }

    const reports = await getAllReports(academicSupervisorID);
    const stats = await getReportsStats(academicSupervisorID);

    return res.status(200).json({
      success: true,
      stats,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};
/**
 * Get students for a specific report.
 * This function shows the students related to the report
 * and their submission status.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.reportID - Report ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */

export const getReportStudentsController = async (req, res) => {
  try {
    const { reportID } = req.params;

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!reportID) {
      return res.status(400).json({
        success: false,
        message: "reportID is required",
      });
    }

    const students = await getReportStudentsForSupervisor(
      reportID,
      academicSupervisorID
    );

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Error fetching report students:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching report students",
      error: error.message,
    });
  }
};
/**
 * Get a student's submission answers.
 * This function returns the answers of one submitted report
 * so the supervisor can review them.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.submissionID - Submission ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */
export const getSubmissionAnswersController = async (req, res) => {
  try {
    const { submissionID } = req.params;

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!submissionID) {
      return res.status(400).json({
        success: false,
        message: "submissionID is required",
      });
    }

    const submission = await getSubmissionAnswersForSupervisor(
      submissionID,
      academicSupervisorID
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching submission answers",
      error: error.message,
    });
  }
};
/**
 * Approve a student's report submission.
 * The supervisor can approve a submission only if it belongs
 * to one of their reports.
 * @param {Object} req - Request object.
 * @param {Object} req.params - Route parameters.
 * @param {number|string} req.params.submissionID - Submission ID.
 * @param {Object} res - Response object.
 * @returns {Promise<void>}
 */
export const approveSubmissionController = async (req, res) => {
  try {
    const { submissionID } = req.params;

    const academicSupervisorID = getAcademicSupervisorID(req);

    if (!academicSupervisorID) {
      return res.status(401).json({
        success: false,
        message: "Academic supervisor ID not found in token",
      });
    }

    if (!submissionID) {
      return res.status(400).json({
        success: false,
        message: "submissionID is required",
      });
    }

    const result = await approveSubmission(
      submissionID,
      academicSupervisorID
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found or not related to this supervisor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Submission approved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving submission",
      error: error.message,
    });
  }
};