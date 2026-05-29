import db from "../config/dbConnect.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class LogbookController {
  static generateLogbook(req, res) {
    const { studentId } = req.params;

    // ✅ تأكيد الاتصال
    if (!db) {
      return res.status(500).json({ message: "Database connection not established" });
    }

    // ✅ استعلام بيانات الطالب
    const studentQuery = `
  SELECT studentID, periodID, TrainingStatus, universityGPA, level
  FROM STUDENT
  WHERE studentID = ?
`;


   // ✅ استعلام تقارير الطالب
const reportsQuery = `
  SELECT 
    cr.reportID,
    cr.reportStatus AS status,
    rs.submissionDate,
    rs.submissionTime,
    cr.periodID
  FROM REPORT_SUBMISSION rs
  JOIN CASE_REPORT cr ON rs.reportID = cr.reportID
  WHERE rs.studentID = ?
  ORDER BY rs.submissionDate DESC, rs.submissionTime DESC
`;

    db.query(studentQuery, [studentId], (err, studentResult) => {
      if (err) {
        console.error("Database Error (student):", err);
        return res.status(500).json({ message: "Database error (student)" });
      }

      if (studentResult.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = studentResult[0];

      db.query(reportsQuery, [studentId], (err, reportsResult) => {
        if (err) {
          console.error("Database Error (reports):", err);
          return res.status(500).json({ message: "Database error (reports)" });
        }

        // ✅ إنشاء مجلد uploads إذا ما كان موجود
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir);
        }

        // ✅ إنشاء ملف PDF داخل uploads
        const filePath = path.join(uploadsDir, `logbook_${studentId}.pdf`);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // عنوان رئيسي
        doc.fontSize(22).text("Student Logbook", { align: "center" });
        doc.moveDown();

        // بيانات الطالب
        doc.fontSize(16).text(`Student ID: ${student.studentID}`);
        doc.text(`Training Status: ${student.TrainingStatus}`);
        doc.text(`University GPA: ${student.universityGPA}`);
        doc.text(`Level: ${student.level}`);
        doc.text(`Period ID: ${student.periodID || "N/A"}`);
        doc.moveDown();

        // عنوان فرعي
        doc.fontSize(18).text("Case Reports", { underline: true });
        doc.moveDown();

        // تقارير الطالب
        if (reportsResult.length === 0) {
          doc.fontSize(14).text("No reports found for this student.");
        } else {
          reportsResult.forEach((report, index) => {
            doc.fontSize(14).text(`Report #${index + 1}`);
            doc.text(`Report ID: ${report.reportID}`);
            doc.text(`Status: ${report.status}`);
            doc.text(`Submission Date: ${report.submissionDate}`);
            doc.text(`Submission Time: ${report.submissionTime}`);
            doc.text(`Period ID: ${report.periodID}`);
            doc.moveDown();
          });
        }

        doc.end();

        // ✅ بعد إنشاء الملف، نرسله للتحميل
        stream.on("finish", () => {
          res.download(filePath, `logbook_${studentId}.pdf`);
        });
      });
    });
  }
}

export default LogbookController;