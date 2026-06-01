import db from "../config/dbConnect.js";

export const getReportsByStudentIdModel = (studentId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cr.reportID,
        cr.reportTitle,
        cr.reportStatus,
        cr.publishedAt,

        rs.submissionID,
        rs.approvalStatus,
        rs.submissionDate,
        rs.submissionTime
      FROM REPORT_SUBMISSION rs
      JOIN CASE_REPORT cr 
        ON rs.reportID = cr.reportID
      WHERE rs.studentID = ?
      ORDER BY rs.submissionDate DESC, rs.submissionTime DESC
    `;

    db.query(query, [studentId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export const getReportByIdModel = (reportId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        reportID,
        templateID,
        periodID,
        academicSupervisorID,
        reportTitle,
        reportStatus,
        publishedAt
      FROM CASE_REPORT
      WHERE reportID = ?
    `;

    db.query(query, [reportId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export const getAcademicSupervisorsModel = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT userID, firstName, secondName, lastName, email
      FROM \`User\`
      WHERE role = 'AcademicSupervisor'
      ORDER BY firstName ASC, lastName ASC
    `;

    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export const updateReportStatusModel = (submissionId, status, supervisorId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE REPORT_SUBMISSION
      SET
        approvalStatus = ?,
        approvedBy = ?,
        approvedAt = NOW()
      WHERE submissionID = ?
    `;

    db.query(query, [status, supervisorId, submissionId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
