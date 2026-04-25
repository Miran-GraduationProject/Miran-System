import dbConnect from "../../config/dbConnect.js";

const db = dbConnect.promise();
// 1. عرض التقرير + الحقول للطالب
export const getReport = async (req, res) => {
  try {
    const { reportID } = req.params;

    // جلب التقرير
    const [report] = await db.query(
      "SELECT * FROM CASE_REPORT WHERE reportID = ?",
      [reportID]
    );

    if (report.length === 0) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    // جلب الحقول (الأسئلة)
    const [fields] = await db.query(
      "SELECT * FROM ReportField WHERE templateID = ?",
      [report[0].templateID]
    );

    res.json({
      report: report[0],
      fields: fields
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching report",
      error: error.message
    });
  }
};


// 2. حفظ إجابات الطالب
export const submitReport = async (req, res) => {
  try {
    const { reportID, answers } = req.body;

    // answers = [{fieldID, answer}]

    if (!reportID || !answers) {
      return res.status(400).json({
        message: "reportID and answers are required"
      });
    }

    for (let a of answers) {
      await db.query(
        `INSERT INTO REPORT_ANSWER (reportID, fieldID, answer)
         VALUES (?, ?, ?)`,
        [
          reportID,
          a.fieldID,
          a.answer
        ]
      );
    }

    res.json({
      message: "Report submitted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error submitting report",
      error: error.message
    });
  }
};

