import db from "../config/dbConnect.js";

class MandatoryCasesController {
  // ✅ GET كل الحالات الإلزامية
  getMandatoryCases(req, res) {
    const query = "SELECT * FROM Mandatory_Cases";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({
          message: "Database error while fetching mandatory cases",
        });
      }
      res.status(200).json({
        message: "Mandatory cases retrieved successfully",
        data: results,
      });
    });
  }

  // ✅ POST إضافة حالة إلزامية جديدة
  addMandatoryCase(req, res) {
    const { caseName, description_text, notes, periodID, createdBy } = req.body;
    const query = `
      INSERT INTO Mandatory_Cases (caseName, description_text, notes, periodID, createdBy)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [caseName, description_text, notes, periodID, createdBy], (err, result) => {
      if (err) {
        console.error("❌ Database Error:", err);
        return res.status(500).json({
          message: "Database error while adding mandatory case",
        });
      }
      res.status(201).json({
        message: "Mandatory case added successfully",
        caseID: result.insertId,
      });
    });
  }

  // ✅ GET اختبار بسيط
  testTable(req, res) {
    res.status(200).json({ message: "Test route working fine ✅" });
  }
}

// ✅ إنشاء كائن من الكلاس وتصديره
const controller = new MandatoryCasesController();
export default controller;
