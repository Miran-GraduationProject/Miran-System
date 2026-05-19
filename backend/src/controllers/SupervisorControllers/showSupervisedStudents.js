import { getSupervisedStudents } from "../../models/supervisorModel/getSupervisedStudents.js";
//كلاس يعرض الطلاب المشرف عليهم حسب المستشفى المربطين فيه

const showSupervisedStudents = async (req, res) => { // دالة غير متزامنة async عشان فيها دوال تطلب بيانات
  try {
    const supervisorID = req.user.id;
    const students = await getSupervisedStudents(supervisorID);

    return res.json({ students });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching students", error: err.message || err });
  }
};

export {showSupervisedStudents}


//---------------- خزعبلات ----------------
// import {
//   getAvailablePeriods,
//   getStudentsBySupervisorHospital,
//   searchStudentsByNameInHospital
// } from "../services/supervisorPeriodService.js";

// /**
//  * GET /supervisor/periods
//  * Return all open training periods
//  */
// export const showAvailablePeriods = async (req, res) => {
//   try {
//     const periods = await getAvailablePeriods();
//     return res.json({ periods });
//   } catch (err) {
//     return res.status(500).json({ message: "Error fetching periods", error: err.message || err });
//   }
// };

// /**
//  * GET /supervisor/periods/:periodID/students
//  * Return students registered in the same hospital as the authenticated supervisor
//  * and who belong to the requested period.
//  */
// export const showStudentsByHospital = async (req, res) => {
//   try {
//     const supervisorID = req.user.userID;
//     const { periodID } = req.params;

//     if (!periodID) {
//       return res.status(400).json({ message: "periodID is required" });
//     }

//     const students = await getStudentsBySupervisorHospital(supervisorID, periodID);
//     return res.json({ periodID, students });
//   } catch (err) {
//     return res.status(500).json({ message: "Error fetching students", error: err.message || err });
//   }
// };

// /**
//  * GET /supervisor/periods/:periodID/search?name=...
//  * Search for students by exact name (case-insensitive) within the supervisor's hospital
//  * and the specified period. Returns only exact matches as required.
//  */
// export const searchStudents = async (req, res) => {
//   try {
//     const supervisorID = req.user.userID;
//     const { periodID } = req.params;
//     const { name } = req.query;

//     if (!periodID) {
//       return res.status(400).json({ message: "periodID is required" });
//     }

//     if (!name || !name.trim()) {
//       return res.status(400).json({ message: "name query parameter is required" });
//     }

//     const results = await searchStudentsByNameInHospital(supervisorID, periodID, name);
//     return res.json({ periodID, name: name.trim(), results });
//   } catch (err) {
//     return res.status(500).json({ message: "Error searching students", error: err.message || err });
//   }
// };