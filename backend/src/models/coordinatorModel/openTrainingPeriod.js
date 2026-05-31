/**هذا الكلاس شغلته بس انه يتكلم مع قاعدة البيانات فقط ويحقق رابع ريكواريمنت
 * 
 * 
 */

import dbConnect from "../../config/dbConnect.js";
 
 
// تفتح فترة ويضيف المستشفيات الي يبغاها ويسوي حفظ
// وطبعا يفتح ترانزكشن بمعنى يايزبط كلو مرا وحده ولا لا مافي حل وسط
const openTrainingPeriod = async (data) => {

    const { name, level, startDate, endDate, registrationOpen, registrationClose, activatedBy, hospitals } = data;

    const connection = await dbConnect.promise().getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            `INSERT INTO TRAINING_PERIOD (name, level, startDate, endDate, registrationOpen, registrationClose, status, activatedBy, activatedAt, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, NOW(), NOW())`,
            [name, level, startDate, endDate, registrationOpen, registrationClose, activatedBy]
        );
 
        const newPeriodID = result.insertId;
 
        for (const h of hospitals) {
            await connection.execute(
                `INSERT INTO TRAINING_OPPORTUNITY (hospitalID, periodID, maleCapacity, femaleCapacity, status, createdAt)
                 VALUES (?, ?, ?, ?, 'ACTIVE', NOW())`,
                [h.hospitalID, newPeriodID, h.maleCapacity, h.femaleCapacity]
            );
        }
 
        await connection.commit();
        return { periodID: newPeriodID, name, level, status: "OPEN" };
 
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
 
 

// نتاكد ان لكل مستوى فترة وحده مفتوحه بنفس الوقت
const checkOpenPeriodByLevel = async (level) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT * FROM TRAINING_PERIOD WHERE status = 'OPEN' AND level = ? LIMIT 1`,
        [level]
    );
    return rows[0] || null;
};


// تحدّث الحالات تلقائياً بناءً على التواريخ
// CLOSED → OPEN   إذا بدأ وقت التسجيل ولم ينته بعد
// OPEN   → CLOSED إذا انتهى وقت التسجيل
// INACTIVE → ACTIVE   إذا بدأ التدريب ولم ينته بعد
// ACTIVE   → INACTIVE إذا انتهى تاريخ الفترة
const syncStatuses = async () => {
    const now = new Date();

    // الفترات المغلقة اللي بدأ وقت تسجيلها تصبح OPEN
    await dbConnect.promise().execute(
        `UPDATE TRAINING_PERIOD
         SET status = 'OPEN'
         WHERE status = 'CLOSED' AND registrationOpen <= ? AND registrationClose >= ?`,
        [now, now]
    );

    // الفترات المفتوحة اللي انتهى تسجيلها تصبح CLOSED
    await dbConnect.promise().execute(
        `UPDATE TRAINING_PERIOD
         SET status = 'CLOSED'
         WHERE status = 'OPEN' AND registrationClose < ?`,
        [now]
    );

    // الفرص المرتبطة بفترات بدأ تدريبها تصبح ACTIVE
    await dbConnect.promise().execute(
        `UPDATE TRAINING_OPPORTUNITY op
         JOIN TRAINING_PERIOD p ON p.periodID = op.periodID
         SET op.status = 'ACTIVE'
         WHERE op.status = 'INACTIVE' AND p.startDate <= ? AND p.endDate >= ?`,
        [now, now]
    );

    // الفرص المرتبطة بفترات انتهى تدريبها تصبح INACTIVE
    await dbConnect.promise().execute(
        `UPDATE TRAINING_OPPORTUNITY op
         JOIN TRAINING_PERIOD p ON p.periodID = op.periodID
         SET op.status = 'INACTIVE'
         WHERE op.status = 'ACTIVE' AND p.endDate < ?`,
        [now]
    );
};


// تجيب كل الفترات باختصار ايش ماكان مستواها
const getAllPeriods = async () => {
    await syncStatuses();
    const [rows] = await dbConnect.promise().execute(
        `SELECT * FROM TRAINING_PERIOD ORDER BY level ASC, createdAt DESC`
    );
    return rows;
};
 
 
// لو نبغا نعدل او نضيف او نحذف مستشفى قبل بدء التسجيل 
//  فا اول شي تجيب بيانات البيريود اي دي علشان تتاكد انها موجوده قبل تعدل عليها
const getPeriodByID = async (periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT * FROM TRAINING_PERIOD WHERE periodID = ? LIMIT 1`,
        [periodID]
    );
    return rows[0] || null;
};


// اذا جينا نعدل الفترة نقدر نضيف مستشفيات جديدة وسعاتها
const addHospitalToPeriod = async (periodID, hospitalData) => {
    const { hospitalID, maleCapacity, femaleCapacity } = hospitalData;

    await dbConnect.promise().execute(
        `INSERT INTO TRAINING_OPPORTUNITY (hospitalID, periodID, maleCapacity, femaleCapacity, status, createdAt)
         VALUES (?, ?, ?, ?, 'ACTIVE', NOW())`,
        [hospitalID, periodID, maleCapacity, femaleCapacity]
    );

    return { periodID, hospitalID, status: "OPEN" };
};
 
 
//ونقدر نحذفها
const removeHospitalFromPeriod = async (periodID, hospitalID) => {
    const [result] = await dbConnect.promise().execute(
        `DELETE FROM TRAINING_OPPORTUNITY
         WHERE periodID = ? AND hospitalID = ?`,
        [periodID, hospitalID]
    );
    // عدد الصوفوف الي نم حذفها
    return result.affectedRows > 0;
};
 
 
// الي هي يجيب احصائيات التسجيل
const getRegistrationStats = async (periodID) => {
    // نحدّث الحالات أولاً لضمان أن الإحصائيات تعكس الوضع الحالي
    await syncStatuses();
// تعريف المتغير period عشان نستخدمه في الاستعلامات الجاية
  // ونحط فيه بيانات فترة التدريب
     let period;
// اول شي تجيب الفترة عن طريق الاي دي حقها او الي حاليا مفتوحه
    if (periodID) {
        const [rows] = await dbConnect.promise().execute(
            `SELECT * FROM TRAINING_PERIOD WHERE periodID = ?`,
            [periodID]
        );
        // اذا ما لقى فترة رجع null
        if (!rows[0]) return null;
        period = rows[0];
    } else {
        const [rows] = await dbConnect.promise().execute(
            `SELECT * FROM TRAINING_PERIOD WHERE status = 'OPEN' LIMIT 1`,
            []
        );
        if (!rows[0]) return null;
        period = rows[0];
    }
// هنا بيجيب لكل مستشفى كم عندهم ذكور واناث 
// ومن خلال جدول الفرص بيشوف مين الي منجد سجلو 
    const [hospitals] = await dbConnect.promise().execute(
        `SELECT op.opportunityID, op.hospitalID, h.name AS hospitalName,
                op.maleCapacity, op.femaleCapacity,
                COUNT(DISTINCT CASE WHEN u.gender = 'Male' THEN sp.studentID END) AS maleRegistered,
                COUNT(DISTINCT CASE WHEN u.gender = 'Female' THEN sp.studentID END) AS femaleRegistered
         FROM TRAINING_OPPORTUNITY op
         JOIN HOSPITAL h ON h.hospitalID = op.hospitalID
         LEFT JOIN STUDENT_PREFERENCE sp ON sp.opportunityID = op.opportunityID
         LEFT JOIN \`User\` u ON u.userID = sp.studentID
         WHERE op.periodID = ?
         GROUP BY op.opportunityID, op.hospitalID, h.name, op.maleCapacity, op.femaleCapacity
         ORDER BY h.name ASC`,
        [period.periodID]
    );

    // هنا بيجمع كل الطلاب بالنظام 
    // الي فوق هي هو عدد الذكور وعدد الاناث واجمالي الطلاب
    const [totals] = await dbConnect.promise().execute(
        `SELECT
            (SELECT COUNT(*) FROM \`User\` u JOIN STUDENT s ON s.studentID = u.userID WHERE u.role = 'Student' AND s.level = ?) AS totalStudents,
            (SELECT COUNT(*) FROM \`User\` u JOIN STUDENT s ON s.studentID = u.userID WHERE u.role = 'Student' AND u.gender = 'Male' AND s.level = ?) AS totalMaleStudents,
            (SELECT COUNT(*) FROM \`User\` u JOIN STUDENT s ON s.studentID = u.userID WHERE u.role = 'Student' AND u.gender = 'Female' AND s.level = ?) AS totalFemaleStudents,
            (SELECT COUNT(DISTINCT sp.studentID) FROM STUDENT_PREFERENCE sp WHERE sp.periodID = ?) AS totalRegistered,
            (SELECT COUNT(DISTINCT sp.studentID) FROM STUDENT_PREFERENCE sp JOIN \`User\` u ON u.userID = sp.studentID WHERE sp.periodID = ? AND u.gender = 'Male') AS totalMaleRegistered,
            (SELECT COUNT(DISTINCT sp.studentID) FROM STUDENT_PREFERENCE sp JOIN \`User\` u ON u.userID = sp.studentID WHERE sp.periodID = ? AND u.gender = 'Female') AS totalFemaleRegistered`,
        [period.level, period.level, period.level, period.periodID, period.periodID, period.periodID]
    );

    return { period, hospitals, ...totals[0] };
};


// تجيب كل hospitalIDs المرتبطة بفترة معينة — للتحقق قبل التعديل
const getLinkedHospitalIDs = async (periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT hospitalID FROM TRAINING_OPPORTUNITY WHERE periodID = ?`,
        [periodID]
    );
    return rows.map(r => Number(r.hospitalID));
};


// تحديث بيانات الفترة وسعات مستشفياتها  
const updatePeriodWithCapacities = async (periodID, data, hospitals) => {
    const { name, level, startDate, endDate, registrationOpen, registrationClose } = data;
    const connection = await dbConnect.promise().getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            `UPDATE TRAINING_PERIOD
             SET name = ?, level = ?, startDate = ?, endDate = ?,
                 registrationOpen = ?, registrationClose = ?
             WHERE periodID = ?`,
            [name, level, startDate, endDate, registrationOpen, registrationClose, periodID]
        );

        for (const h of hospitals) {
            const [opResult] = await connection.execute(
                `UPDATE TRAINING_OPPORTUNITY
                 SET maleCapacity = ?, femaleCapacity = ?
                 WHERE periodID = ? AND hospitalID = ?`,
                [h.maleCapacity, h.femaleCapacity, periodID, h.hospitalID]
            );
            if (opResult.affectedRows === 0) {
                const err = new Error(`No TRAINING_OPPORTUNITY row matched periodID=${periodID} and hospitalID=${h.hospitalID}`);
                err.code = 'NO_ROWS_MATCHED';
                throw err;
            }
        }

        await connection.commit();
        return { periodID, name, level, changed: result.changedRows > 0 };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


// بيحذف الفترة التدريبية و كل  شي  يرتبط فيها حرفيا 
const deleteTrainingPeriod = async (periodID) => {
    const connection = await dbConnect.promise().getConnection();
    try {
        await connection.beginTransaction();

        // نحذف رغبات الطلاب المرتبطة بالفرص
        await connection.execute(
            `DELETE sp FROM STUDENT_PREFERENCE sp
             JOIN TRAINING_OPPORTUNITY op ON op.opportunityID = sp.opportunityID
             WHERE op.periodID = ?`,
            [periodID]
        );

        // نحذف التوزيع بالجدول المؤقت
        await connection.execute(
            `DELETE FROM ALLOCATION_PREVIEW WHERE periodID = ?`,
            [periodID]
        );

        // نحذف الفرص المرتبطة بالفترة
        await connection.execute(
            `DELETE FROM TRAINING_OPPORTUNITY WHERE periodID = ?`,
            [periodID]
        );

        // نحذف الفترة نفسها
        await connection.execute(
            `DELETE FROM TRAINING_PERIOD WHERE periodID = ?`,
            [periodID]
        );

        await connection.commit();
        return { periodID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


export {
    syncStatuses,
    openTrainingPeriod,
    checkOpenPeriodByLevel,
    getAllPeriods,
    getPeriodByID,
    getLinkedHospitalIDs,
    updatePeriodWithCapacities,
    addHospitalToPeriod,
    removeHospitalFromPeriod,
    getRegistrationStats,
    deleteTrainingPeriod
};