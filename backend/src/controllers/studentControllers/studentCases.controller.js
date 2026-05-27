
import db from "../../config/dbConnect.js";

export const getStudentCases = async (req, res) => {
  try {
    const studentId = req.user.id; // الحصول على معرف الطالب من التوكن  
    // جلب الحالات الإلزامية للطالب
    const [cases] = await db.promise().query('SELECT caseID, caseName, notes, templateID  FROM Mandatory_Cases');
   
    if (cases.length === 0) {
      return res.status(200).json({ message: "No cases found", data: [] });
    }
// جلب تقارير الحالات الخاصة بالطالب  
    const [reports] = await db.promise().query(
      'SELECT templateID, decision FROM CASE_REPORT WHERE studentID = ?',
      [studentId]
    );
//   لتسهيل الوصول إلى تقارير الحالات بناءً على templateID 
    const reportMap = new Map();
    reports.map(r => [r.templateID, r]);

  const result = cases.map((c) => {
  const report = reports.find(
    (r) => Number(r.templateID) === Number(c.templateID)
  );

      let status = "pending";
      if (report) {
        switch (report.decision) {
          case "Accept":
            status = "accepted";
            break;

          case "Reject":
            status = "rejected";
            break;

          case "Needs Revision":
              status = "needs revision";
              break;

          case "Pending":
                status = "pending";
                break;

          default:
            status = "pending";
         }
      }
      
      return {
        caseID: c.caseID,
        caseName: c.caseName,
        notes: c.notes,
        status
      };
    });

    return res.status(200).json({ message: "Cases retrieved successfully", data: result });

  } catch (error) {
    console.error("Get Student Cases Error:", error);
    return res.status(500).json({ message: "Error fetching cases" });
  }
};
