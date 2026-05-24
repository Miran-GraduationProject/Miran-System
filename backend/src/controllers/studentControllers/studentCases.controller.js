
import db from "../../config/dbConnect.js";

export const getStudentCases = async (req, res) => {
  try {
    const studentId = req.user.id; // الحصول على معرف الطالب من التوكن  
   // جلب الحالات الإلزامية للطالب
    const [cases] = await db.promise().query('SELECT caseID, caseName, notes, templateID  FROM Mandatory_Cases');


// جلب التقارير المرتبطة بالطالب
const [reports] = await db.promise().query(
  `
  SELECT 
    cr.templateID,
    rs.approvalStatus,
    rs.submissionID
  FROM REPORT_SUBMISSION rs
  JOIN CASE_REPORT cr
    ON rs.reportID = cr.reportID
  WHERE rs.studentID = ?
    AND cr.reportStatus = 'PUBLISHED'
  `,
  [studentId]
);

    // دمج الحالات مع التقارير لتحديد الحالة النهائية لكل حالة
   const result = cases.map(c => {
    // البحث عن التقرير المرتبط بالحالة الحالية
const report = reports.find(r => r.templateID === c.templateID);      
        let status = "pending";

// تحديد الحالة النهائية بناءً على حالة موافقة المشرف
if (report) {
  if (report.approvalStatus === "APPROVED") {
    status = "accepted";
  } else {
    status = "completed";
  }
}

  return {
    caseID: c.caseID,
    caseName: c.caseName,
    notes: c.notes,
    status
  };
});
// طباعة النتيجة في الكونسول للتأكد من صحتها
    console.log("RESULT:", result);
    res.json(result);
// إرسال النتيجة إلى الواجهة
  } catch (error) {
 // طباعة الخطأ في الكونسول للتصحيح  
console.error("Error:", error);
    res.status(500).json({ error: "Error fetching cases" });
  }
};

