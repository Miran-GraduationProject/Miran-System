/**
 * هذا الكلاس بيحقق خامس ريكواريمنت والي هي ان الطالب يرتب اولوياته    
 * لما يفك صفحة التسجيل ويشوف كل المستشفيات ويرتبها ويسوي حفظ هذا الكلاس هو الي يروح لقاعدة البيانات ويحفظ او يمسح او يعدل الترتيب
 * عندنا أربع وظائف هنا
 */

import dbConnect from "../../config/dbConnect.js";


// تجيب كل المستشفيات الي مسجلة في الفترة عشان الطالب يرتبها
const getAvailableHospitals = async (periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT op.opportunityID, h.hospitalID, h.name AS hospitalName,
                op.maleCapacity, op.femaleCapacity
         FROM TRAINING_OPPORTUNITY op
         JOIN HOSPITAL h ON h.hospitalID = op.hospitalID
         WHERE op.periodID = ?
         ORDER BY h.name ASC`,
        [periodID]
    );
    return rows;
};


// تجيب ترتيب الطالب الحالي
// مثلا يقول جيب لي ترتيب اريام 444007245 في فترة صيف 2026
const getStudentPreferences = async (studentID, periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT sp.preferenceID, sp.opportunityID, h.name AS hospitalName,
                sp.preferenceRank, sp.createdAt
         FROM STUDENT_PREFERENCE sp
         JOIN TRAINING_OPPORTUNITY op ON op.opportunityID = sp.opportunityID
         JOIN HOSPITAL h ON h.hospitalID = op.hospitalID
         WHERE sp.studentID = ? AND sp.periodID = ?
         ORDER BY sp.preferenceRank ASC`,
        [studentID, periodID]
    );
    return rows;
};


//تعديل الرغبات
//اولا ينحذف الترتيب القديم ثم يدخل ترتيبه الجديد
const savePreferences = async (studentID, periodID, preferences) => {
    const connection = await dbConnect.promise().getConnection();

    try {
        await connection.beginTransaction();

        //حذف الترتيب القديم
        await connection.execute(
            `DELETE FROM STUDENT_PREFERENCE
             WHERE studentID = ? AND periodID = ?`,
            [studentID, periodID]
        );

        // نحفظ الترتيب الجديد  
        for (const pref of preferences) {
            await connection.execute(
                `INSERT INTO STUDENT_PREFERENCE (studentID, opportunityID, periodID, preferenceRank, createdAt)
                 VALUES (?, ?, ?, ?, NOW())`,
                [studentID, pref.opportunityID, periodID, pref.preferenceRank]
            );
        }

        await connection.commit();
        return { studentID, periodID, totalPreferences: preferences.length };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


// تجيب مستوى الطالب من جدول STUDENT
const getStudentLevel = async (studentID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT level FROM STUDENT WHERE studentID = ? LIMIT 1`,
        [studentID]
    );
    return rows[0]?.level || null;
};


export {
    getAvailableHospitals,
    getStudentPreferences,
    savePreferences,
    getStudentLevel
};