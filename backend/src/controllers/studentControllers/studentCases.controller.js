
import db from "../../config/dbConnect.js";

export const getStudentCases = async (req, res) => {
  try {
    const studentId = req.user.id; // الحصول على معرف الطالب من التوكن  
    // جلب الحالات الإلزامية للطالب
    const [cases] = await db.promise().query('SELECT caseID, caseName, notes, templateID  FROM Mandatory_Cases');
    // جلب التقارير المرتبطة بالطالب
    const [reports] = await db.promise().query(`SELECT templateID, decision FROM CASE_REPORT WHERE studentID = ?`, [studentId]);
    // دمج الحالات مع التقارير لتحديد الحالة النهائية لكل حالة
   const result = cases.map(c => {
    // البحث عن التقرير المرتبط بالحالة الحالية
   const report = reports.find(r => r.templateID === c.templateID);      
        let status = "pending";
    // تحديد الحالة النهائية بناءً على قرار التقرير
  if (report) {
    const decision = report.decision?.toLowerCase().trim();

    if (decision === "accept") {
      status = "accepted";
    } else if (decision === "reject") {
      status = "rejected";
    } else if (decision === "needs revision") {
      status = "needs revision";
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

// التحقق من وجود حالات في النتيجة وإرسال الرد المناسب  
if (result.length === 0) {
      return res.status(200).json({
        message: "No cases found",
        data: []
      });
    }

    return res.status(200).json({
      message: "Cases retrieved successfully",
      data: result
    });

    res.json(result);
// إرسال النتيجة إلى الواجهة
  } catch (error) {
 // طباعة الخطأ في الكونسول للتصحيح  
console.error("Error:", error);
    res.status(500).json({ error: "Error fetching cases" });
  }};