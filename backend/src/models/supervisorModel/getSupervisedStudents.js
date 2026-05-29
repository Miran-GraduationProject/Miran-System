import dbConnect from '../../config/dbConnect.js';

//جيب الطلاب المشرف عليهم بناءً على المشرف المحدد لكل مستشفى
const getSupervisedStudents = async (academicSupervisorID) => {
  // جيب مستشفى المشرف المحدد
  const [supRows] = await dbConnect.promise().execute(
    `SELECT selectedHospital FROM \`User\` WHERE userID = ? LIMIT 1`, // ليمت تحدد صف واحد فقط
    [academicSupervisorID]
  );

  const supervisorHospital = supRows[0].selectedHospital;

  // جيب الطلاب الي داخلين في نفس المشتفى للمشرف
  const [rows] = await dbConnect.promise().execute(
    `SELECT u.firstName, u.lastName, u.gender, u.email, s.studentID, s.periodID, s.level
     FROM STUDENT s
     JOIN \`User\` u ON u.userID = s.studentID
     WHERE u.selectedHospital = ?`,
    [supervisorHospital]
  );

  // جيب كل التقارير للطالب
  for (let student of rows) {
    const [reportRows] = await dbConnect.promise().execute(
  `SELECT COUNT(*) AS reports
   FROM REPORT_SUBMISSION rs
   JOIN CASE_REPORT cr ON rs.reportID = cr.reportID
   WHERE rs.studentID = ?
     AND cr.academicSupervisorID = ?
     AND cr.reportStatus = 'PUBLISHED'`,
  [student.studentID, academicSupervisorID]
);

    // احسب عدد التقارير واضفها للطالب
    student.reports = reportRows[0].reports;

    const [periodRows] = await dbConnect.promise().execute(
      `SELECT name FROM TRAINING_PERIOD WHERE periodID = ? LIMIT 1`,
      [student.periodID]
    );

    student.periodName = periodRows[0]?.name || "Unknown Period";

  }

  if (!rows[0]) return ["No students assigned on your hospital"];

  return rows;
};

export {getSupervisedStudents};

// --------------------------- خزعبلات ---------------------------------------------
// const getSupervisedStudents = async (academicSupervisorID) => {
//     const [rows] = await dbConnect.promise().execute(
//         `SELECT u.userID, u.firstName, u.lastName, u.gender, s.studentID
//          FROM STUDENT s
//          JOIN User u ON u.userID = s.studentID
//          JOIN User sup ON sup.userID = ?
//          WHERE s.selectedHospital = sup.selectedHospital`
//         [academicSupervisorID]
//     );
//     return rows;
// };


// const searchStudent = async (academicSupervisorID, periodID, name) => {
//   //if (!name || !name.trim()) return [];

//   const keyword = name.trim(); // يزبط التنسيق يحذف المسافات

//   // جيب مستشفى المشرف
//   const [supRows] = await dbConnect.promise().execute(
//     `SELECT hospitalID FROM \`User\` WHERE userID = ? LIMIT 1`,
//     [academicSupervisorID]
//   );

//   //if (!supRows[0] || !supRows[0].hospitalID) return [];

//   const supervisorHospitalID = supRows[0].hospitalID;

//   // prepare full name
//   const fullName = `${keyword}`;

//   const [rows] = await dbConnect.promise().execute(
//     `SELECT u.userID, u.firstName, u.lastName, u.gender, s.studentID, s.periodID, s.hospitalID
//      FROM STUDENT s
//      JOIN \`User\` u ON u.userID = s.studentID
//      WHERE s.periodID = ?
//        AND s.hospitalID = ?
//        AND (
//          LOWER(CONCAT(u.firstName, ' ', u.lastName)) = LOWER(?)
//          OR LOWER(u.firstName) LIKE LOWER(?)
//          OR LOWER(u.secondName) LIKE LOWER(?)
//          OR LOWER(u.lastName) LIKE LOWER(?)
//        )`,
//     [periodID, supervisorHospitalID, fullName, keyword, keyword]
//   );

//   return rows;
// };
