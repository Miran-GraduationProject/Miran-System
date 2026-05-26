import db from "../config/dbConnect.js";

export const getReportsByStudentIdModel = (studentId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM CASE_REPORT
      WHERE studentID = ?
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
      SELECT * FROM CASE_REPORT
      WHERE reportID = ?
    `;

    db.query(query, [reportId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};