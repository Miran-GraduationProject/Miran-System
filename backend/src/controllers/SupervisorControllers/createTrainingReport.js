import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();
//  إنشاء تقارير تدريب لكل الطلاب في فترة معينة
export const createTrainingReport = async (req, res) => {
  try {
    const { templateID, periodID } = req.body;

    // التأكد من إرسال البيانات
    if (!templateID || !periodID) {
      return res.status(400).json({
        message: "templateID and periodID are required"
      });
    }

    // 1. يجيب الطلاب حسب الفترة التدريبية
    const [students] = await db.query(
      "SELECT studentID FROM STUDENT WHERE periodID = ?",
      [periodID]
    );

    if (students.length === 0) {
      return res.status(404).json({
        message: "No students found in this period"
      });
    }

    // 2. التحقق من وجود التمبلت
    const [template] = await db.query(
      "SELECT * FROM TEMPLATE WHERE templateID = ?",
      [templateID]
    );

    if (template.length === 0) {
      return res.status(404).json({
        message: "Template not found"
      });
    }

    // 3. إنشاء تقرير لكل طالب
  for (let student of students) {
  await db.query(
    `INSERT INTO CASE_REPORT 
    (status, templateID, studentID, periodID, submissionDate, submissionTime)
    VALUES (?, ?, ?, ?, CURDATE(), CURTIME())`,
    [
      "Submitted",
      templateID,
      student.studentID,
      periodID
    ]
  );
}

    // 4. نجاح العملية
    res.json({
      message: "Training reports created successfully",
      totalStudents: students.length
    });

  } catch (error) {
    console.error("Create Training Report Error:", error);

    res.status(500).json({
      message: "Error creating training reports",
      error: error.message
    });
  }
};
