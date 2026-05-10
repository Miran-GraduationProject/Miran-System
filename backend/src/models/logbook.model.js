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
            SELECT CR.reportID, CR.status, CR.submissionDate, CR.submissionTime,
                   T.reportTitle, RF.fieldLabel, RA.answer
            FROM CASE_REPORT CR
            JOIN TEMPLATE T ON CR.templateID = T.templateID
            JOIN REPORT_ANSWER RA ON CR.reportID = RA.reportID
            JOIN ReportField RF ON RA.fieldID = RF.fieldID
            WHERE CR.studentID = ?
            ORDER BY CR.reportID, RF.fieldID
        `;
        db.query(query, [studentId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};
