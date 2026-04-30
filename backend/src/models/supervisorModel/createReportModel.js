import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();

/* ================= انشاء تقرير ================= */

export const createTrainingReport = async (templateID, periodID) => {

  // يجيب الطلاب حسب الفترة
  const [students] = await db.execute(
    "SELECT studentID FROM STUDENT WHERE periodID = ?",
    [periodID]
  );

  if (!students.length) {
    return { message: "No students found in this period" };
  }

  // التأكد من وجود التمبلت
  const [template] = await db.execute(
    "SELECT * FROM TEMPLATE WHERE templateID = ?",
    [templateID]
  );

  if (!template.length) {
    return { message: "Template not found" };
  }

  // إنشاء تقرير لكل طالب
  for (let student of students) {
    await db.execute(
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

  return {
    message: "Training reports created successfully",
    totalStudents: students.length
  };
};



/**
 * هذا الملف مسؤول عن إنشاء تقارير التدريب للطلاب
 * يستخدمه المشرف لإنشاء تقرير لكل طالب في فترة تدريب معينة
 * الفكرة:
 * عند اختيار Template + Period
 * يتم إنشاء تقرير لكل طالب داخل هذه الفترة
 *
 * الوظيفة الوحيدة:
 * 1. إنشاء تقارير تدريب لجميع الطلاب
 */