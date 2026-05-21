import db from '../../config/dbConnect.js';

export const createCase = async (req, res) => {
  
if (!req.user) {
    return res.status(401).json({ message: "No token provided" });
  }

  // التحقق من أن المستخدم هو مشرف أكاديمي 
  if (req.user.role !== "AcademicSupervisor") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const { caseName, description_text, notes } = req.body;
    const createdBy = req.user.id;

    // التحقق من وجود الحقول المطلوبة   
  if (typeof caseName !== "string" || !caseName.trim()) {
      return res.status(400).json({ message: "case name is required" });
    }
    if (typeof description_text !== "string" || !description_text.trim()) {
      return res.status(400).json({ message: "description_text is required" });
    }
        if (typeof notes !== "string" && notes !== undefined ){}
// التحقق من وجود قالب واحد على الأقل في قاعدة البيانات 
    const [template] = await db.promise().query( 
      "SELECT templateID FROM TEMPLATE LIMIT 1"
    );
    if (template.length === 0) {
      return res.status(400).json({ message: "Invalid templateID" });
    }
    const templateID = template[0].templateID;   
   
    // التحقق من وجود فترة تدريب واحدة على الأقل في قاعدة البيانات  
    const [period] = await db.promise().query(
      "SELECT periodID FROM TRAINING_PERIOD LIMIT 1"
    );
    if (period.length === 0) {
      return res.status(400).json({ message: "Invalid periodID" });
    }
    const periodID = period[0].periodID;
   
   // إنشاء الحالة في قاعدة البيانات    
     const [result] = await db.promise().query(
      `INSERT INTO Mandatory_Cases
      (caseName, description_text, notes, templateID, periodID, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [caseName, description_text, notes || null, templateID, periodID, createdBy]
    );

    // إرسال الرد مع تفاصيل الحالة الجديدة    
   return res.status(200).json({
      message: "Case created successfully",
      case: {
        caseID: result.insertId,
        caseName,
        description_text,
        notes,
        templateID,
        periodID,
        createdBy
      }
    });

  } catch (error) {
    console.error("Error creating case:", error);
    return res.status(500).json({ message: "Failed to create case" });
  }
};



export const updateCase = async (req, res) => {

    const { caseID } = req.params;

// التحقق من وجود المستخدم في الطلب
     if (!req.user) {
    return res.status(401).json({ message: " no token provided" });
  }
// التحقق من أن المستخدم هو مشرف أكاديمي    
    if (req.user.role !== "AcademicSupervisor") {
        return res.status(403).json({ message: "Forbidden" });
    }
    try {
       const {caseID} = req.params;
       const { caseName, description_text, notes } = req.body;

// التحقق من وجود الحقول المطلوبة قبل محاولة تحديث الحالة   
       if(caseName === undefined || caseName === "") {
        return res.status(400).json({ message: "case name is required" });
       }

if (caseName !== undefined && typeof caseName !== "string") {
            return res.status(400).json({
                message: "invalid data type for case name"
            });
        }

// التحقق من أن description_text موجود وليس فارغًا   
    if(description_text === undefined || description_text === "") {
        return res.status(400).json({ message: "description_text is required" });
       }

        if (description_text !== undefined && typeof description_text !== "string") {
            return res.status(400).json({
                message: "invalid data type for description_text"
            });
        }
    
if (notes !== undefined && typeof notes !== "string") {
            return res.status(400).json({
                message: "invalid data type for notes"
            });
        }

    const [caseData] = await db.promise().query(
        'SELECT * FROM Mandatory_Cases WHERE caseID = ?',
        [caseID]
    );
    // التحقق من وجود الحالة قبل محاولة تحديثها
    if (caseData.length === 0) {
        return res.status(404).json({ message: "Case not found" });
    }
    // تحديث الحالة في قاعدة البيانات   
    await db.promise().query(
        'UPDATE Mandatory_Cases SET caseName = ?, description_text = ?, notes = ? WHERE caseID = ?',
        [caseName, description_text, notes || null, caseID]
    );

    return res.status(200).json({ message: 'Case updated successfully' });

    } catch (error) {
        console.error('Error updating case:', error);
        return res.status(500).json({ message: 'Failed to update case' });
    }
};





export const deleteCase = async (req, res) => {
    // التحقق من وجود المستخدم في الطلب
    if (!req.user) {
       return res.status(401).json({ message: " no token provided" });
    }
    // التحقق من أن المستخدم هو مشرف أكاديمي    
    if (req.user.role !== "AcademicSupervisor") {
        return res.status(403).json({ message: "you don't have permission" });
    }

   
    try {
        const { caseID } = req.params;

        const [caseData] = await db.promise().query(
            'SELECT * FROM Mandatory_Cases WHERE caseID = ?',
            [caseID]
        );

            if (caseData.length === 0) {
                return res.status(404).json({ message: "Case not found" });
            } 
        // التحقق من وجود الحالة قبل محاولة حذفها   
    if (caseData.length === 0) {
        return res.status(404).json({ message: "Case not found" });
    }
   // حذف الحالة من قاعدة البيانات
    await db.promise().query(
        'DELETE FROM Mandatory_Cases WHERE caseID = ?',
        [caseID]
    );

    return res.json({ message: 'Case deleted successfully' });

    } catch (error) {
        console.error('Error deleting case:', error);
        return res.status(500).json({ message: 'Failed to delete case' });
    }
};