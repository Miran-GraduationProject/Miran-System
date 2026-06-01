import db from "../../config/dbConnect.js";

/**
 * Create a new mandatory case for all students under the supervisor's hospital.
 *
 * Resolves the template by its title, then finds the open training period
 * linked to the supervisor's hospital via HOSPITAL → TRAINING_OPPORTUNITY → TRAINING_PERIOD.
 * The submission window (startDate/endDate) must fall within that period.
 *
 * @route  POST /api/supervisor/cases
 * @access AcademicSupervisor
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {string}  req.body.caseName          - Name of the case.
 * @param {string}  req.body.description_text  - Description of the case.
 * @param {string}  [req.body.notes]            - Optional notes.
 * @param {string}  req.body.reportTitle        - Title of the report template to attach.
 * @param {string}  req.body.startDate          - Submission window start date (YYYY-MM-DD).
 * @param {string}  req.body.endDate            - Submission window end date (YYYY-MM-DD).
 * @returns {Object} 201 - { message, caseID }
 */
export const createCase = (req, res) => {
  const { caseName, description_text, notes, reportTitle, startDate, endDate } = req.body;

  if (!caseName?.trim())         return res.status(400).json({ message: "اسم الحالة مطلوب" });
  if (!description_text?.trim()) return res.status(400).json({ message: "الوصف مطلوب" });
  if (!reportTitle?.trim())      return res.status(400).json({ message: "قالب التقرير مطلوب" });
  if (!startDate)                return res.status(400).json({ message: "تاريخ البداية مطلوب" });
  if (!endDate)                  return res.status(400).json({ message: "تاريخ النهاية مطلوب" });
  if (new Date(startDate) >= new Date(endDate))
    return res.status(400).json({ message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية" });

  db.query(
    "SELECT templateID FROM TEMPLATE WHERE reportTitle = ?",
    [reportTitle.trim()],
    (err, templateRows) => {
      if (err) return res.status(500).json({ message: "خطأ في جلب القالب" });
      if (templateRows.length === 0) return res.status(400).json({ message: "القالب غير موجود" });

      const templateID = templateRows[0].templateID;

      // جلب فترة التدريب المتاحة الخاصة بمستشفى المشرف
      db.query(
        `SELECT DISTINCT tp.periodID, tp.startDate AS pStart, tp.endDate AS pEnd
         FROM HOSPITAL h
         JOIN TRAINING_OPPORTUNITY op ON op.hospitalID = h.hospitalID
         JOIN TRAINING_PERIOD tp ON tp.periodID = op.periodID
         WHERE h.supervisorID = ? AND tp.status = 'OPEN'
         LIMIT 1`,
        [req.user.id],
        (err2, periodRows) => {
          if (err2) return res.status(500).json({ message: "خطأ في جلب الفترة التدريبية" });
          if (periodRows.length === 0)
            return res.status(400).json({ message: "لا توجد فترة تدريب مفتوحة لطلابك حالياً" });

          const { periodID, pStart, pEnd } = periodRows[0];

          // التحقق أن فترة التسليم ضمن فترة التدريب
          const caseStart   = new Date(startDate);
          const caseEnd     = new Date(endDate);
          const periodStart = new Date(pStart);
          const periodEnd   = new Date(pEnd);

          if (caseStart < periodStart || caseEnd > periodEnd) {
            const ps = new Date(pStart).toISOString().slice(0, 10);
            const pe = new Date(pEnd).toISOString().slice(0, 10);
            return res.status(400).json({
              message: `تواريخ التسليم يجب أن تكون ضمن فترة التدريب (${ps} — ${pe})`,
            });
          }

          db.query(
            `INSERT INTO Mandatory_Cases (caseName, description_text, notes, templateID, periodID, startDate, endDate, createdBy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              caseName.trim(),
              description_text.trim(),
              notes?.trim() || null,
              templateID,
              periodID,
              startDate,
              endDate,
              req.user.id,
            ],
            (err3, result) => {
              if (err3) {
                console.error("Error creating case:", err3);
                return res.status(500).json({ message: "خطأ في إنشاء الحالة" });
              }
              return res.status(201).json({ message: "تم إنشاء الحالة بنجاح", caseID: result.insertId });
            }
          );
        }
      );
    }
  );
};

/**
 * Get all mandatory cases created by the logged-in supervisor.
 *
 * @route  GET /api/supervisor/cases
 * @access AcademicSupervisor
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {Object} 200 - { message, data: Case[] }
 */
export const getCases = (req, res) => {
  db.query(
    "SELECT caseID, caseName, description_text, notes, templateID, startDate, endDate FROM Mandatory_Cases WHERE createdBy = ?",
    [req.user.id],
    (err, cases) => {
      if (err) {
        console.error("Error fetching cases:", err);
        return res.status(500).json({ message: "خطأ في جلب الحالات" });
      }
      return res.status(200).json({ message: "Cases retrieved successfully", data: cases });
    }
  );
};

/**
 * Update an existing mandatory case.
 *
 * Only the supervisor who created the case can update it.
 * All body fields are optional — only provided fields are updated.
 * If startDate/endDate are provided, both must be present and fall
 * within the supervisor's open training period.
 *
 * @route  PUT /api/supervisor/cases/:caseID
 * @access AcademicSupervisor
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {number} req.params.caseID            - ID of the case to update.
 * @param {string} [req.body.caseName]           - New case name.
 * @param {string} [req.body.description_text]   - New description.
 * @param {string} [req.body.notes]              - New notes (empty string to clear).
 * @param {string} [req.body.reportTitle]        - New report template title.
 * @param {string} [req.body.startDate]          - New submission start date (YYYY-MM-DD).
 * @param {string} [req.body.endDate]            - New submission end date (YYYY-MM-DD).
 * @returns {Object} 200 - { message }
 */
export const updateCase = async (req, res) => {
  try {
    const caseID = Number(req.params.caseID);
    if (!caseID || isNaN(caseID))
      return res.status(400).json({ message: "معرّف الحالة غير صالح" });

    const [existing] = await db.promise().query(
      "SELECT createdBy FROM Mandatory_Cases WHERE caseID = ?",
      [caseID]
    );
    if (existing.length === 0)
      return res.status(404).json({ message: "الحالة غير موجودة" });
    if (existing[0].createdBy !== req.user.id)
      return res.status(403).json({ message: "لا تملك صلاحية تعديل هذه الحالة" });

    const { caseName, description_text, notes, reportTitle, startDate, endDate } = req.body;

    if (caseName !== undefined && (typeof caseName !== "string" || !caseName.trim()))
      return res.status(400).json({ message: "اسم الحالة يجب أن يكون نصاً غير فارغ" });

    if (description_text !== undefined && (typeof description_text !== "string" || !description_text.trim()))
      return res.status(400).json({ message: "الوصف يجب أن يكون نصاً غير فارغ" });

    if (notes !== undefined && typeof notes !== "string")
      return res.status(400).json({ message: "الملاحظات يجب أن تكون نصاً" });

    // جلب templateID إذا أُرسل reportTitle
    let templateID;
    if (reportTitle !== undefined) {
      if (typeof reportTitle !== "string" || !reportTitle.trim())
        return res.status(400).json({ message: "قالب التقرير يجب أن يكون نصاً غير فارغ" });

      const [template] = await db.promise().query(
        "SELECT templateID FROM TEMPLATE WHERE reportTitle = ?",
        [reportTitle.trim()]
      );
      if (template.length === 0)
        return res.status(400).json({ message: "القالب غير موجود" });

      templateID = template[0].templateID;
    }

    if ((startDate === undefined) !== (endDate === undefined))
      return res.status(400).json({ message: "يجب إرسال تاريخ البداية والنهاية معاً" });

    if (startDate !== undefined) {
      if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate)))
        return res.status(400).json({ message: "التواريخ غير صالحة" });

      if (new Date(startDate) >= new Date(endDate))
        return res.status(400).json({ message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية" });

      const [periodRows] = await db.promise().query(
        `SELECT tp.startDate AS pStart, tp.endDate AS pEnd
         FROM HOSPITAL h
         JOIN TRAINING_OPPORTUNITY op ON op.hospitalID = h.hospitalID
         JOIN TRAINING_PERIOD tp ON tp.periodID = op.periodID
         WHERE h.supervisorID = ? AND tp.status = 'OPEN'
         LIMIT 1`,
        [req.user.id]
      );

      if (periodRows.length === 0)
        return res.status(400).json({ message: "لا توجد فترة تدريب مفتوحة لطلابك حالياً" });

      const { pStart, pEnd } = periodRows[0];
      if (new Date(startDate) < new Date(pStart) || new Date(endDate) > new Date(pEnd)) {
        const ps = new Date(pStart).toISOString().slice(0, 10);
        const pe = new Date(pEnd).toISOString().slice(0, 10);
        return res.status(400).json({
          message: `تواريخ التسليم يجب أن تكون ضمن فترة التدريب (${ps} — ${pe})`,
        });
      }
    }

    const fields = [];
    const values = [];

    if (caseName !== undefined)       { fields.push("caseName = ?");        values.push(caseName.trim()); }
    if (description_text !== undefined){ fields.push("description_text = ?"); values.push(description_text.trim()); }
    if (notes !== undefined)          { fields.push("notes = ?");            values.push(notes ? notes.trim() : null); }
    if (templateID !== undefined)     { fields.push("templateID = ?");       values.push(templateID); }
    if (startDate !== undefined)      { fields.push("startDate = ?");        values.push(startDate); }
    if (endDate !== undefined)        { fields.push("endDate = ?");          values.push(endDate); }

    if (fields.length === 0)
      return res.status(400).json({ message: "لم يتم إرسال أي بيانات للتعديل" });

    values.push(caseID);

    const [result] = await db.promise().query(
      `UPDATE Mandatory_Cases SET ${fields.join(", ")} WHERE caseID = ?`,
      values
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "الحالة غير موجودة" });

    return res.status(200).json({ message: "تم تعديل الحالة بنجاح" });

  } catch (error) {
    console.error("Error updating case:", error);
    return res.status(500).json({ message: "خطأ في تعديل الحالة" });
  }
};

/**
 * Delete a mandatory case by ID.
 *
 * Only the supervisor who created the case can delete it.
 *
 * @route  DELETE /api/supervisor/cases/:caseID
 * @access AcademicSupervisor
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {number} req.params.caseID - ID of the case to delete.
 * @returns {Object} 200 - { message }
 */
export const deleteCase = async (req, res) => {
  try {
    const caseID = Number(req.params.caseID);

    if (!caseID || isNaN(caseID))
      return res.status(400).json({ message: "معرّف الحالة غير صالح" });

    const [rows] = await db.promise().query(
      "SELECT createdBy FROM Mandatory_Cases WHERE caseID = ?",
      [caseID]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "الحالة غير موجودة" });

    if (rows[0].createdBy !== req.user.id)
      return res.status(403).json({ message: "لا تملك صلاحية حذف هذه الحالة" });

    await db.promise().query("DELETE FROM Mandatory_Cases WHERE caseID = ?", [caseID]);

    return res.status(200).json({ message: "تم حذف الحالة بنجاح" });

  } catch (error) {
    console.error("Error deleting case:", error);
    return res.status(500).json({ message: "خطأ في حذف الحالة" });
  }
};