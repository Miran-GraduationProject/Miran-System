import db from "../config/dbConnect.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class LogbookController {
  static generateLogbook(req, res) {
    const { studentId } = req.params;


    if (!db) {
      return res.status(500).json({ message: "Database connection not established" });
    }

    // بيانات الطالب
    const studentQuery = `
      SELECT studentID, periodID, TrainingStatus, universityGPA, level
      FROM STUDENT
      WHERE studentID = ?
    `;

    // تقارير الطالب (مع templateID + submissionID)
    const reportsQuery = `
      SELECT 
        cr.reportID,
        cr.reportStatus AS status,
        rs.submissionDate,
        rs.submissionTime,
        cr.periodID,
        cr.templateID,     -- مهم لجلب الحقول
        rs.submissionID    -- مهم لجلب الإجابات
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

      db.query(reportsQuery, [studentId], async (err, reportsResult) => {
        if (err) {
          console.error("Database Error (reports):", err);
          return res.status(500).json({ message: "Database error (reports)" });
        }

              // هنا نجيب الحقول والإجابات لكل تقرير
        for (let report of reportsResult) {
          // جلب الحقول الخاصة بالنموذج
          const fields = await new Promise((resolve, reject) => {
            db.query(
              "SELECT fieldID, fieldLabel FROM REPORT_FIELD WHERE templateID = ?",
              [report.templateID],
              (err, result) => {
                if (err) {
                  console.error("Database Error (fields):", err);
                  resolve([]); // لا نرمي خطأ — عشان ما يوديك صفحة error
                } else {
                  resolve(result);
                }
              }
            );
          });

          // جلب إجابات الطالب
          const answers = await new Promise((resolve, reject) => {
            db.query(
              "SELECT fieldID, answerText FROM REPORT_ANSWER WHERE submissionID = ?",
              [report.submissionID],
              (err, result) => {
                if (err) {
                  console.error("Database Error (answers):", err);
                  resolve([]); //  نفس الشي — ما نخليها توقف
                } else {
                  resolve(result);
                }
              }
            );
          });

          // دمج الحقول مع الإجابات
          report.details = fields.map((field) => {
            const answer = answers.find((a) => a.fieldID === field.fieldID);
            return {
              label: field.fieldLabel,
              answer: answer ? answer.answerText : "—",
            };
          });
        }

                //  بعد ما خلصنا دمج الحقول والإجابات، نبدأ إنشاء الـ PDF

        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir);
        }


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

        // عنوان التقارير
        doc.fontSize(18).text("Case Reports", { underline: true });
        doc.moveDown();


        if (reportsResult.length === 0) {
          doc.fontSize(14).text("No reports found for this student.");
        } else {
          reportsResult.forEach((report, index) => {
            doc.fontSize(16).text(`Report #${index + 1}`, { underline: true });
            doc.fontSize(14).text(`Report ID: ${report.reportID}`);
            doc.text(`Status: ${report.status}`);
            doc.text(`Submission Date: ${report.submissionDate}`);
            doc.text(`Submission Time: ${report.submissionTime}`);
            doc.text(`Period ID: ${report.periodID}`);
            doc.moveDown();

            // طباعة الحقول والإجابات
            doc.fontSize(15).text("Report Details:", { underline: true });
            doc.moveDown(0.5);

            if (report.details.length === 0) {
              doc.fontSize(12).text("No fields or answers found.");
            } else {
              report.details.forEach((item) => {
                doc.fontSize(14).text(`• ${item.label}`);
                doc.fontSize(12).text(`  Answer: ${item.answer}`);
                doc.moveDown(0.5);
              });
            }

            doc.moveDown();
          });
        }

        doc.end();

        // إرسال الملف للتحميل
        stream.on("finish", () => {
          res.download(filePath, `logbook_${studentId}.pdf`);
        });
      });
    });
  }
}

export default LogbookController;