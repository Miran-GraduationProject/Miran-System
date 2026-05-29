import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* =====================================================
   REPORT VIEW MODEL

   النظام النهائي:
   CASE_REPORT = تقرير عام منشور لفترة تدريبية
   REPORT_SUBMISSION = تسليم الطالب
   REPORT_ANSWER = إجابات الطالب

   لا يعتمد على الأعمدة القديمة:
   - CASE_REPORT.studentID
   - CASE_REPORT.status
   - CASE_REPORT.decision
   - CASE_REPORT.submissionDate
   - CASE_REPORT.submissionTime
   - REPORT_ANSWER.reportID
===================================================== */


/* =====================================================
   1. عرض التقرير كقالب فارغ مع حقوله
   GET /api/supervisor/report/view/:reportID
===================================================== */

export const getReport = async (reportID) => {
  const [reportRows] = await db.execute(
    `
    SELECT
      cr.reportID,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,
      cr.reportTitle,
      cr.reportStatus,
      cr.publishedAt,

      tp.name AS periodName,
      tp.level AS periodLevel,
      tp.startDate,
      tp.endDate,

      t.reportTitle AS templateTitle

    FROM CASE_REPORT cr

    LEFT JOIN TRAINING_PERIOD tp
      ON cr.periodID = tp.periodID

    LEFT JOIN TEMPLATE t
      ON cr.templateID = t.templateID

    WHERE cr.reportID = ?
      AND cr.reportStatus = 'PUBLISHED'
    `,
    [reportID]
  );

  if (!reportRows.length) {
    return null;
  }

  const report = reportRows[0];

  const [fields] = await db.execute(
    `
    SELECT
      fieldID,
      templateID,
      fieldLabel,
      fieldType,
      isRequired

    FROM ReportField

    WHERE templateID = ?

    ORDER BY fieldID ASC
    `,
    [report.templateID]
  );

  return {
    ...report,
    fields,
  };
};


/* =====================================================
   2. جلب التقارير المنشورة التي أنشأها المشرف الحالي فقط
   GET /api/supervisor/reports
===================================================== */

export const getAllReports = async (academicSupervisorID) => {
  const [rows] = await db.execute(
    `
    SELECT
      cr.reportID,
      cr.reportTitle,
      cr.reportStatus,
      cr.publishedAt,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,

      tp.name AS periodName,
      tp.level AS periodLevel,
      tp.startDate,
      tp.endDate,

      COUNT(DISTINCT s.studentID) AS totalStudents,
      COUNT(DISTINCT rs.submissionID) AS submittedStudents

    FROM CASE_REPORT cr

    JOIN TRAINING_PERIOD tp
      ON cr.periodID = tp.periodID

    LEFT JOIN STUDENT s
      ON s.periodID = cr.periodID

    LEFT JOIN REPORT_SUBMISSION rs
      ON rs.reportID = cr.reportID
     AND rs.studentID = s.studentID

    WHERE cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'

    GROUP BY
      cr.reportID,
      cr.reportTitle,
      cr.reportStatus,
      cr.publishedAt,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,
      tp.name,
      tp.level,
      tp.startDate,
      tp.endDate

    ORDER BY cr.publishedAt DESC, cr.reportID DESC
    `,
    [academicSupervisorID]
  );

  return rows;
};


/* =====================================================
   3. إحصائيات التقارير والتسليمات للمشرف الحالي فقط
===================================================== */

export const getReportsStats = async (academicSupervisorID) => {
  const [rows] = await db.execute(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM CASE_REPORT
        WHERE academicSupervisorID = ?
          AND reportStatus = 'PUBLISHED'
      ) AS totalReports,

      (
        SELECT COUNT(*)
        FROM REPORT_SUBMISSION rs
        JOIN CASE_REPORT cr
          ON rs.reportID = cr.reportID
        WHERE cr.academicSupervisorID = ?
          AND cr.reportStatus = 'PUBLISHED'
          AND rs.approvalStatus = 'PENDING'
      ) AS pendingReports,

      (
        SELECT COUNT(*)
        FROM REPORT_SUBMISSION rs
        JOIN CASE_REPORT cr
          ON rs.reportID = cr.reportID
        WHERE cr.academicSupervisorID = ?
          AND cr.reportStatus = 'PUBLISHED'
          AND rs.approvalStatus = 'PENDING'
      ) AS reviewReports,

      (
        SELECT COUNT(*)
        FROM REPORT_SUBMISSION rs
        JOIN CASE_REPORT cr
          ON rs.reportID = cr.reportID
        WHERE cr.academicSupervisorID = ?
          AND cr.reportStatus = 'PUBLISHED'
          AND rs.approvalStatus = 'APPROVED'
      ) AS completedReports
    `,
    [
      academicSupervisorID,
      academicSupervisorID,
      academicSupervisorID,
      academicSupervisorID,
    ]
  );

  return rows[0];
};


/* =====================================================
   4. عرض كل طلاب التقرير: مين سلّم ومين ما سلّم
   GET /api/supervisor/report/:reportID/students
===================================================== */

export const getReportStudentsForSupervisor = async (
  reportID,
  academicSupervisorID
) => {
  const [rows] = await db.execute(
    `
    SELECT
      cr.reportID,
      cr.reportTitle,
      cr.periodID,

      s.studentID,
      u.firstName,
      u.secondName,
      u.lastName,
      u.email,

      rs.submissionID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime,
      rs.approvedAt,

      CASE
        WHEN rs.submissionID IS NULL THEN 'NOT_SUBMITTED'
        ELSE 'SUBMITTED'
      END AS submissionStatus

    FROM CASE_REPORT cr

    JOIN STUDENT s
      ON s.periodID = cr.periodID

    JOIN \`User\` u
      ON u.userID = s.studentID

    LEFT JOIN REPORT_SUBMISSION rs
      ON rs.reportID = cr.reportID
     AND rs.studentID = s.studentID

    WHERE cr.reportID = ?
      AND cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'

    ORDER BY u.firstName ASC, u.lastName ASC
    `,
    [reportID, academicSupervisorID]
  );

  return rows;
};


/* =====================================================
   5. عرض إجابات طالب معين للمشرف
   GET /api/supervisor/submission/:submissionID/answers
===================================================== */

export const getSubmissionAnswersForSupervisor = async (
  submissionID,
  academicSupervisorID
) => {
  const [submissionRows] = await db.execute(
    `
    SELECT
      rs.submissionID,
      rs.reportID,
      rs.studentID,
      rs.approvalStatus,
      rs.submissionDate,
      rs.submissionTime,
      rs.approvedBy,
      rs.approvedAt,

      cr.reportTitle,
      cr.templateID,
      cr.periodID,
      cr.academicSupervisorID,

      u.firstName,
      u.secondName,
      u.lastName,
      u.email

    FROM REPORT_SUBMISSION rs

    JOIN CASE_REPORT cr
      ON rs.reportID = cr.reportID

    JOIN \`User\` u
      ON rs.studentID = u.userID

    WHERE rs.submissionID = ?
      AND cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'
    `,
    [submissionID, academicSupervisorID]
  );

  if (!submissionRows.length) {
    return null;
  }

  const [answers] = await db.execute(
    `
    SELECT
      ra.answerID,
      ra.fieldID,
      ra.answer,

      rf.fieldLabel,
      rf.fieldType,
      rf.isRequired

    FROM REPORT_ANSWER ra

    JOIN ReportField rf
      ON ra.fieldID = rf.fieldID

    WHERE ra.submissionID = ?

    ORDER BY rf.fieldID ASC
    `,
    [submissionID]
  );

  return {
    ...submissionRows[0],
    answers,
  };
};


/* =====================================================
   6. موافقة المشرف على تسليم الطالب
   PUT /api/supervisor/submission/:submissionID/approve
===================================================== */

export const approveSubmission = async (
  submissionID,
  academicSupervisorID
) => {
  const [result] = await db.execute(
    `
    UPDATE REPORT_SUBMISSION rs

    JOIN CASE_REPORT cr
      ON rs.reportID = cr.reportID

    SET
      rs.approvalStatus = 'APPROVED',
      rs.approvedBy = ?,
      rs.approvedAt = NOW()

    WHERE rs.submissionID = ?
      AND cr.academicSupervisorID = ?
      AND cr.reportStatus = 'PUBLISHED'
    `,
    [academicSupervisorID, submissionID, academicSupervisorID]
  );

  return result;
};