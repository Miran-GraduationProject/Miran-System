import db from '../../config/dbConnect.js';

export const createCase = async (req, res) => {
  try{
    const { caseName, description_text, notes, reportTitle, startDate, endDate } = req.body;
    if (caseName === undefined) {
      return res.status(400).json({ message: "case name is required" });
    }
    if (description_text === undefined) {
      return res.status(400).json({ message: "description text is required" });
    }
    if(reportTitle === undefined) {
      return res.status(400).json({ message: "report title is required" });
    }
    if (startDate === undefined) {
      return res.status(400).json({ message: "start date is required" });
    }
    if (endDate === undefined) {
      return res.status(400).json({ message: "end date is required" });
    }

    if (typeof caseName !== "string" || caseName.trim() === "") {
      return res.status(400).json({ message: "case name must be a non-empty string" });
    }
    if (typeof description_text !== "string" || description_text.trim() === "") {
      return res.status(400).json({ message: "description text must be a non-empty string" });
    }
    if (typeof reportTitle !== "string" || reportTitle.trim() === "") {
      return res.status(400).json({ message: "report title must be a non-empty string" });
    }
    
    const cleanReportTitle = reportTitle.trim();

    if(typeof startDate !== "string" || typeof endDate !== "string" || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      return res.status(400).json({ message: "start date and end date must be valid date strings" });
    }

    if(new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "start date must be before end date" });
    }

    if(notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({ message: "notes must be a string" });
    }

    const [template] = await db.promise().query(
        "SELECT templateID FROM TEMPLATE WHERE reportTitle = ?",
        [cleanReportTitle]
    );

    if (template.length === 0) {
      return res.status(400).json({ message: "Template not found" });
    }
    const templateID = template[0].templateID;

    const[period] = await db.promise().query(
      "SELECT periodID FROM TRAINING_PERIOD WHERE startDate = ? AND endDate = ? AND status = 'OPEN'",
      [startDate, endDate]
    );

    if (period.length === 0) {
      return res.status(400).json({ message: "No OPEN training period found for the given dates" });
    }
    const periodID = period[0].periodID;

    const [result] = await db.promise().query(
      "INSERT INTO Mandatory_Cases (caseName, description_text, notes, templateID, periodID, createdBy) VALUES (?, ?, ?, ?, ?, ?)",
      [
        caseName.trim(),
        description_text.trim(),
        notes ? notes.trim() : null,
        templateID,
        periodID,
        req.user.id
      ]
    );

    return res.status(201).json({
      message: "Case created successfully",
      caseID: result.insertId
    });
    } catch (error) {
      console.error('Error creating case:', error);
      return res.status(500).json({ message: 'Internal server error while creating case' });
    }
};



export const updateCase = async (req, res) => {
try {
     const caseID = Number(req.params.caseID);

        if (!caseID || isNaN(caseID)) {
         return res.status(400).json({ message: "Invalid case ID" });
         }

         const { caseName, description_text, notes, reportTitle, startDate, endDate } = req.body;
     
         if (caseName !== undefined) {
        if (typeof caseName !== "string" || caseName.trim() === "") {
            return res.status(400).json({ message: "case name must be a non-empty string" });
        }
        }

        if (description_text !== undefined) {
        if (typeof description_text !== "string" || description_text.trim() === "") {
            return res.status(400).json({ message: "description text must be a non-empty string" });
        }
        }

        
       if (notes !== undefined && typeof notes !== "string") {
            return res.status(400).json({ message: "notes must be a string" });
         }


    let templateID;
    if (reportTitle !== undefined) {
        if (typeof reportTitle !== "string" || reportTitle.trim() ===""){
            return res.status(400).json({message: "report title must be a non-empty string"});
        }
        const cleanReportTitle = reportTitle.trim();
        const [template] = await db.promise().query(
            "SELECT templateID FROM TEMPLATE WHERE reportTitle = ?",
            [cleanReportTitle]
        );

        if (template.length === 0) {
            return res.status(400).json({ message: "Template not found" });
        }
        templateID = template[0].templateID;
      }

        let periodID;
        
            if (startDate !== undefined && endDate === undefined) {
                return res.status(400).json({ message: "end date is required" });
            }

            if (endDate !== undefined && startDate === undefined) {
                return res.status(400).json({ message: "start date is required" });
            }

            if (
            (startDate !== undefined && typeof startDate !== "string") ||
            (endDate !== undefined && typeof endDate !== "string") ||
            (startDate !== undefined && isNaN(Date.parse(startDate))) ||
            (endDate !== undefined && isNaN(Date.parse(endDate)))){
            return res.status(400).json({ message: "start date and end date must be valid date strings" });
        }

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
       return res.status(400).json({ message: "start date must be before end date"});
        }

        if (startDate !== undefined && endDate !== undefined) {

        const [period] = await db.promise().query(
            "SELECT periodID FROM TRAINING_PERIOD WHERE startDate = ? AND endDate = ? AND status = 'OPEN'",
            [startDate, endDate]
        );

        if (period.length === 0) {
            return res.status(400).json({ message: "No OPEN training period found for the given dates" });
        }
        periodID = period[0].periodID;
    }

        const fields = [];
        const values = [];

        if (caseName !== undefined){
            fields.push("caseName = ?");
            values.push(caseName.trim());
        }

        
        if (description_text !== undefined){
            fields.push("description_text = ?");
            values.push(description_text.trim());
        }

          if (notes !== undefined){
            fields.push("notes = ?");
            values.push(notes ? notes.trim() : null);
        }

          if (templateID !== undefined){
            fields.push("templateID = ?");
            values.push(templateID);

        }

          if (periodID !== undefined){
            fields.push("periodID = ?");
            values.push(periodID);
        }

        if (fields.length === 0) {
            return res.status(400).json({message: "No data provided to update"});
        }

        values.push(caseID);

        const [result] = await db.promise().query(
            `UPDATE Mandatory_Cases SET ${fields.join(", ")} WHERE caseID = ?`, 
            values
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Case not found" });
        }
            return res.status(200).json({
             message: "Case updated successfully"
            });

 
} catch (error) {
    console.error("Error updating case:", error);
    return res.status(500).json({ message: "Internal server error while updating case" });
  }
};





export const deleteCase = async (req, res) => {
try {

    const caseID = req.params.caseID;

    if (!caseID) {
        return res.status(400).json({
            message: "case ID is required"
        })
    }

    if (isNaN(caseID)) {
        return res.status(400).json({
         message: "Invalid case ID" 
        });
    }

    
    const numericID = Number(caseID);

    const [result] = await db.promise().query(
        "DELETE FROM Case_Student WHERE caseID = ?",
        [caseID]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ 
            message: "Case not found"
        });
    }

    return res.status(200).json({ message: "Case deleted successfully" });

} catch (error) {

    console.error("Error deleting case:", error);
    
    return res.status(500).json({
         message: "Internal server error while deleting case"
     });
  } 
};