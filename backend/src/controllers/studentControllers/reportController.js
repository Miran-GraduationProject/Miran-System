import {
  getStudentReports,
  getReport,
  getReportFields,
  getReportAnswers,
  submitReportAnswers,
} from "../../models/studentModel/reportModel.js";

/* ================= استخراج رقم الطالب من التوكن ================= */

const getStudentIDFromToken = (req) => {
  return req.user?.id || req.user?.userID || req.user?.studentID;
};

/* ================= يعرض قائمة التقارير للطالب ================= */

export const getStudentReportsController = async (req, res) => {
  try {
    const studentID = getStudentIDFromToken(req);

    if (!studentID) {
      return res.status(401).json({
        message: "Student ID not found in token",
      });
    }

    const reports = await getStudentReports(studentID);

    return res.json({
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student reports",
      error: error.message,
    });
  }
};

/* ================= يعرض تقرير واحد للطالب ================= */
/*
  إذا التقرير غير مسلم:
  يرجع report + fields + answers فاضية

  إذا التقرير مسلم:
  يرجع report + fields + answers
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

    return res.json({
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

/* ================= حفظ اجابات الطالب ================= */

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
      return res.status(400).json(result);
    }

    return res.json({
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