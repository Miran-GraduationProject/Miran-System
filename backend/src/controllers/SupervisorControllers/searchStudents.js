import { getSupervisedStudents } from "../../models/supervisorModel.js";
// كلاس يخلي المشرف يبحث عن الطالب بادخال الاسم


const searchStudents = async (req, res) => {
  try {
    const supervisorID = req.user.id;
    const { name } = req.query;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const writtenName = name.trim(); // يزبط التنسيق يحذف المسافات


    const studentsList = await getSupervisedStudents(supervisorID);
    //console.log("studentsList:", studentsList);

    const results = studentsList.filter(student => {
    const fullName = `${student.firstName} ${student.secondName} ${student.lastName}`.toLowerCase();
    return (
      fullName.includes(writtenName.toLowerCase()) ||
      student.firstName.toLowerCase().includes(writtenName.toLowerCase()) ||
      student.lastName.toLowerCase().includes(writtenName.toLowerCase())
      );
    });

    // if (!studentsList || !studentsList.students) {
    //   return res.json({ name: writtenName, results: ["No results."] });
    // }

    return res.json({ name: name.trim(), results});

  } catch (err) {
    return res.status(500).json({ message: "Error searching students", error: err.message || err });
  }
};

export {searchStudents}


// ---- خزعبلات -----------------

// // جيب الطلاب الي يطابقو الاسم المدخل
// const searchStudents = async (academicSupervisorID, name) => {

  

//     const studentsList = await getSupervisedStudents(academicSupervisorID);

//     const writtenName = `${keyword}`;

//     const [rows] = await dbConnect.promise().execute(
//         `SELECT u.firstName, u.lastName, u.gender, s.studentID, s.periodID
//         FROM STUDENT s
//         JOIN \`User\` u ON u.userID = s.studentID
//         WHERE u.selectedHospital = ?
//             AND (
//             LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(?)
//             OR LOWER(u.firstName) LIKE LOWER(?)
//             OR LOWER(u.secondName) LIKE LOWER(?)
//             OR LOWER(u.lastName) LIKE LOWER(?)
//         )`,
//         [studentsList, writtenName, keyword, keyword]
//     );

//   return rows;
// };
