import {
  getReport,
  getAllReports,
  getReportsStats,
  getReportStudentsForSupervisor,
  getSubmissionAnswersForSupervisor,
  approveSubmission,
} from "../../models/supervisorModel/reportViewModel.js";

/* =====================================================
   REPORT VIEW CONTROLLER

   النظام النهائي:
   - عرض التقارير المنشورة التي أنشأها المشرف الحالي
   - عرض التقرير كقالب فارغ مع حقوله
   - عرض كل الطلاب ومين سلّم ومين ما سلّم
   - عرض إجابات طالب معين
   - موافقة المشرف
===================================================== */


/* =====================================================
   1. عرض التقرير كقالب فارغ مع حقوله
===================================================== */

export const getReportController = async (req, res) => {
  try {
    const { reportID } = req.params;

    if (!reportID) {
      return res.status(400).json({
        success: false,
        message: "reportID is required",
      });
    }

    const report = await getReport(reportID);

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


/* =====================================================
   2. جلب التقارير المنشورة التي أنشأها المشرف الحالي
===================================================== */

export const getReportsController = async (req, res) => {
  try {
    const academicSupervisorID =
      req.user?.id || req.user?.userID || req.user?.academicSupervisorID;

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


/* =====================================================
   3. عرض كل طلاب تقرير معين: مين سلّم ومين ما سلّم
===================================================== */

export const getReportStudentsController = async (req, res) => {
  try {
    const { reportID } = req.params;

    const academicSupervisorID =
      req.user?.id || req.user?.userID || req.user?.academicSupervisorID;

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


/* =====================================================
   4. عرض إجابات طالب معين للمشرف
===================================================== */

export const getSubmissionAnswersController = async (req, res) => {
  try {
    const { submissionID } = req.params;

    const academicSupervisorID =
      req.user?.id || req.user?.userID || req.user?.academicSupervisorID;

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


/* =====================================================
   5. موافقة المشرف على تسليم الطالب
===================================================== */

export const approveSubmissionController = async (req, res) => {
  try {
    const { submissionID } = req.params;

    const academicSupervisorID =
      req.user?.id || req.user?.userID || req.user?.academicSupervisorID;

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