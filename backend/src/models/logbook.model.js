// logbook.model.js
import db from "../config/dbConnect.js";

// جلب بيانات الطالب
export const getStudentById = (studentId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM STUDENT WHERE studentID = ?`;
        db.query(query, [studentId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

// جلب بيانات التدريب
export const getTrainingPeriodById = (periodId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM TRAINING_PERIOD WHERE periodID = ?`;
        db.query(query, [periodId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

// جلب الحالات الإلزامية
export const getMandatoryCases = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM Mandatory_Cases`;
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// جلب كل التقارير الخاصة بالطالب
export const getReportsByStudentId = (studentId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                cr.reportID,
                cr.reportTitle,
                cr.reportStatus,
                rs.submissionDate,
                rs.submissionTime,
                rf.fieldLabel,
                ra.answer
            FROM REPORT_SUBMISSION rs
            JOIN CASE_REPORT cr ON cr.reportID = rs.reportID
            JOIN REPORT_ANSWER ra ON ra.submissionID = rs.submissionID
            JOIN ReportField rf ON rf.fieldID = ra.fieldID
            WHERE rs.studentID = ?
            ORDER BY cr.reportID, rf.fieldID
        `;

        db.query(query, [studentId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};