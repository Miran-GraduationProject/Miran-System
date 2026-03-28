/**هذا الكلاس شغلته بس انه يتكلم مع قاعدة البيانات فقط ويحقق رابع ريكواريمنت
 * عندنا سبع وضائف هنا
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
                `INSERT INTO TRAINING_OPPORTUNITY (hospitalID, periodID, maleCapacity, femaleCapacity, status, secretaryID, createdAt)
                 VALUES (?, ?, ?, ?, 'ACTIVE', ?, NOW())`,
                [h.hospitalID, newPeriodID, h.maleCapacity, h.femaleCapacity, h.secretaryID]
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


// تجيب كل الفترات المفتوحة باختصار ايش ماكان مستواها
const getAllOpenPeriods = async () => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT * FROM TRAINING_PERIOD WHERE status = 'OPEN' ORDER BY level ASC, createdAt DESC`
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
 
 
//    تعديل
const updateTrainingPeriod = async (periodID, data) => {
    const { name, level, startDate, endDate, registrationOpen, registrationClose } = data;

    await dbConnect.promise().execute(
        `UPDATE TRAINING_PERIOD
         SET name = ?, level = ?, startDate = ?, endDate = ?, registrationOpen = ?, registrationClose = ?
         WHERE periodID = ?`,
        [name, level, startDate, endDate, registrationOpen, registrationClose, periodID]
    );

    return { periodID, name, level, status: "OPEN" };
};
 
 
// اذا جينا نعدل الفترة نقدر نضيف مستشفيات جديدة وسعاتها
    const addHospitalToPeriod = async (periodID, hospitalData) => {
    const { hospitalID, maleCapacity, femaleCapacity, secretaryID } = hospitalData;

    await dbConnect.promise().execute(
        `INSERT INTO TRAINING_OPPORTUNITY (hospitalID, periodID, maleCapacity, femaleCapacity, status, secretaryID, createdAt)
         VALUES (?, ?, ?, ?, 'ACTIVE', ?, NOW())`,
        [hospitalID, periodID, maleCapacity, femaleCapacity, secretaryID]
    );

    return { periodID, hospitalID, status: "OPEN" };
};
 
 
//ونقدر نحذفها 
const removeHospitalFromPeriod = async (periodID, hospitalID) => {
    await dbConnect.promise().execute(
        `DELETE FROM TRAINING_OPPORTUNITY
         WHERE periodID = ? AND hospitalID = ?`,
        [periodID, hospitalID]
    );
    return { periodID, hospitalID };
};
 
 
// بصراحة مني متاكدة منه لانها حاجة اضافية 
// الي هي يجيب احصائيات التسجيل
const getRegistrationStats = async (periodID) => {
    let period;
// اول شي تجيب الفترة عن طريق الاي دي حقها او الي حاليا مفتوحه
    if (periodID) {
        const [rows] = await dbConnect.promise().execute(
            `SELECT * FROM TRAINING_PERIOD WHERE periodID = ?`,
            [periodID]
        );
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
        `SELECT op.opportunityID, h.name AS hospitalName,
                op.maleCapacity, op.femaleCapacity,
                COUNT(DISTINCT CASE WHEN u.gender = 'Male' THEN sp.studentID END) AS maleRegistered,
                COUNT(DISTINCT CASE WHEN u.gender = 'Female' THEN sp.studentID END) AS femaleRegistered
         FROM TRAINING_OPPORTUNITY op
         JOIN HOSPITAL h ON h.hospitalID = op.hospitalID
         LEFT JOIN STUDENT_PREFERENCE sp ON sp.opportunityID = op.opportunityID
         LEFT JOIN \`User\` u ON u.userID = sp.studentID
         WHERE op.periodID = ?
         GROUP BY op.opportunityID, h.name, op.maleCapacity, op.femaleCapacity
         ORDER BY h.name ASC`,
        [period.periodID]
    );

    // هنا بيجمع كل الطلاب بالنظام 
    // الي فوق هي هو عدد الذكور وعدد الاناث واجمالي الطلاب
    const [totals] = await dbConnect.promise().execute(
        `SELECT
            (SELECT COUNT(*) FROM \`User\` WHERE role = 'Student') AS totalStudents,
            (SELECT COUNT(DISTINCT sp.studentID) FROM STUDENT_PREFERENCE sp WHERE sp.periodID = ?) AS totalRegistered,
            (SELECT COUNT(DISTINCT sp.studentID) FROM STUDENT_PREFERENCE sp JOIN \`User\` u ON u.userID = sp.studentID WHERE sp.periodID = ? AND u.gender = 'Male') AS totalMaleRegistered,
            (SELECT COUNT(DISTINCT sp.studentID) FROM STUDENT_PREFERENCE sp JOIN \`User\` u ON u.userID = sp.studentID WHERE sp.periodID = ? AND u.gender = 'Female') AS totalFemaleRegistered`,
        [period.periodID, period.periodID, period.periodID]
    );

    return { period, hospitals, ...totals[0] };
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
    openTrainingPeriod,
    checkOpenPeriodByLevel,
    getAllOpenPeriods,
    getPeriodByID,
    updateTrainingPeriod,
    addHospitalToPeriod,
    removeHospitalFromPeriod,
    getRegistrationStats,
    deleteTrainingPeriod
};