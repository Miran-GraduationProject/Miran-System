/**
 *  يحقق سادس ريكواريمنت والي هي توزيع الطلاب على المستشفيات 
 * اولا توزيع الي وتنعرض وتنحفظ بجدول موقت  بعدها المنسق عنده صلاحيات بانه يعدل بعدها ياكد التوزيع وتنحفظ بجدول ستيودينت انرولمنت 
 *  هذا الكلاس يروح لداتا ويجيب الطلاب الي سجلوا ويجيب  ورغباتهم مرتبه 
 * وسعة  كل فرصه ويحفظ التويع المبدئي وبعدها المنسق يقدر يعدل واذا اكد ينقل النتايج في الجدول النهائي  ويجيب الفترات الاكيدة  والجداول النهائية  لكل مستشفى
 */

import dbConnect from "../../config/dbConnect.js";


// تجيب كل الطلاب اللي سجلوا رغباتهم في الفترة
// مرتبين حسب المعدل من الأعلى، وعند التساوي الأسبقية للي سجل اول
const getStudentsWithPreferences = async (periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT DISTINCT sp.studentID, s.universityGPA, u.gender,
                MIN(sp.createdAt) AS registeredAt
         FROM STUDENT_PREFERENCE sp
         JOIN STUDENT s ON s.studentID = sp.studentID
         JOIN User u ON u.userID = sp.studentID
         WHERE sp.periodID = ?
         GROUP BY sp.studentID, s.universityGPA, u.gender
         ORDER BY s.universityGPA DESC, registeredAt ASC`,
        [periodID]
    );
    return rows;
};


// تجيب رغبات طالب معين داخل فترة معينة وتكون الرغبات مرتبة من الأول للأخير
const getStudentPreferencesByRank = async (studentID, periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT sp.opportunityID, sp.preferenceRank
         FROM STUDENT_PREFERENCE sp
         WHERE sp.studentID = ? AND sp.periodID = ?
         ORDER BY sp.preferenceRank ASC`,
        [studentID, periodID]
    );
    return rows;
};


// تجيب كل الفرص في الفترة مع سعاتها يعني رقم الفرصه وسعة الذكور والاناث
const getOpportunitiesCapacity = async (periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT op.opportunityID, op.maleCapacity, op.femaleCapacity
         FROM TRAINING_OPPORTUNITY op
         WHERE op.periodID = ?`,
        [periodID]
    );
    return rows;
};


//  تحفظ نتيجة التوزيع الأولي في ALLOCATION_PREVIEW الجدول الموقت الي سويناه
const saveAllocationPreview = async (periodID, allocations) => {
    const connection = await dbConnect.promise().getConnection();

    try {
        await connection.beginTransaction();

        // نمسح أي توزيع قديم للفترة
        await connection.execute(
            `DELETE FROM ALLOCATION_PREVIEW WHERE periodID = ?`,
            [periodID]
        );

        // نحفظ التوزيع الجديد
        for (const allocation of allocations) {
            await connection.execute(
                `INSERT INTO ALLOCATION_PREVIEW (periodID, studentID, opportunityID, status, createdAt)
                 VALUES (?, ?, ?, ?, NOW())`,
                 // تنبيه ممكن بعض الطلاب مايتوزعون بغض النظر عن السبب سوا مافي مقاعد الخ يرجع لنا بالاي دي نل وينكتب بعرين غير مسجل بالانقلش
                [periodID, allocation.studentID, allocation.opportunityID || null, allocation.status]
            );
        }

        await connection.commit();
        return { periodID, totalAllocations: allocations.length };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


//  يعرض  نتائج التوزيع الأولي للمنسق يراجعها 
const getAllocationPreview = async (periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT ap.previewID, ap.studentID, u.firstName, u.lastName,
                u.gender, s.universityGPA, h.name AS hospitalName,
                ap.opportunityID, ap.status
         FROM ALLOCATION_PREVIEW ap
         JOIN STUDENT s ON s.studentID = ap.studentID
         JOIN \`User\` u ON u.userID = ap.studentID
         LEFT JOIN TRAINING_OPPORTUNITY op ON op.opportunityID = ap.opportunityID
         LEFT JOIN HOSPITAL h ON h.hospitalID = op.hospitalID
         WHERE ap.periodID = ?
         ORDER BY s.universityGPA DESC`,
        [periodID]
    );
    return rows;
};


// المنسق يعدل توزيع طالب يدوياًاذا حاب
const updateAllocation = async (previewID, opportunityID, status) => {
    await dbConnect.promise().execute(
        `UPDATE ALLOCATION_PREVIEW
         SET opportunityID = ?, status = ?
         WHERE previewID = ?`,
        [opportunityID || null, status, previewID]
    );
    return { previewID, opportunityID, status };
};


// بعد التعديل اليدوي وحفظه بالجدول الموقت راح ناخذ كل المعلومات ونحفضها بالجدول الاساسي ونغير حالة الفترة الى تم التوزيع
const confirmAllocation = async (periodID) => {
    const connection = await dbConnect.promise().getConnection();

    try {
        await connection.beginTransaction();

        // نجيب كل التوزيعات المعتمدة
        const [allocations] = await connection.execute(
            `SELECT * FROM ALLOCATION_PREVIEW
             WHERE periodID = ? AND status = 'Assigned'`,
            [periodID]
        );

        // نحفظ كل واحدة في STUDENT_ENROLLMENT
        for (const allocation of allocations) {
            await connection.execute(
                `INSERT INTO STUDENT_ENROLLMENT (studentID, opportunityID, status, enrolledAt)
                 VALUES (?, ?, 'Enrolled', NOW())`,
                [allocation.studentID, allocation.opportunityID]
            );
        }

        //  نغير حالة الفترة لـ تم التوزيع
        await connection.execute(
            `UPDATE TRAINING_PERIOD SET status = 'ALLOCATED' WHERE periodID = ?`,
            [periodID]
        );

        await connection.commit();
        return { periodID, enrolledCount: allocations.length };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


// هنا علشان صفحة الفرص التدريبية الموكدة
//فا تجيب كل الفترات التي تم تأكيد توزيعها 
const getAllocatedPeriods = async () => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT periodID, name, startDate, endDate, registrationOpen, registrationClose, status, activatedAt
         FROM TRAINING_PERIOD
         WHERE status = 'ALLOCATED'
         ORDER BY activatedAt DESC`
    );
    return rows;
};


// بعد ما تعرف هل هذي الفترة موكدة ولا لا تجيب اسامي الطلاب بحسب الفتررره
const getConfirmedAllocations = async (periodID) => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT h.name AS hospitalName, op.opportunityID,
                op.maleCapacity, op.femaleCapacity,
                u.firstName, u.lastName, u.gender,
                s.universityGPA, u.userID AS studentID,
                se.enrolledAt
         FROM STUDENT_ENROLLMENT se
         JOIN TRAINING_OPPORTUNITY op ON op.opportunityID = se.opportunityID
         JOIN HOSPITAL h ON h.hospitalID = op.hospitalID
         JOIN \`User\` u ON u.userID = se.studentID
         JOIN STUDENT s ON s.studentID = se.studentID
         WHERE op.periodID = ?
         ORDER BY h.name ASC, u.gender DESC, s.universityGPA DESC`,
        [periodID]
    );

// هنا بعد ماتجيب اسامي الطلاب في الفترةالموكدة بتجمعهم حسب كل مستشفى 
// سوينا اوبجكت فاضي 
    const hospitalsMap = {};
   // بعدها بدينا نمر على كل صف بيانات رجع من الداتا 
    for (const row of rows) {
        // راح نبدا نجمع اسامي الطلاب بناء علىاي دي الفرصه غلشان كل فرصه مرتبطة باسم مستشفى وبالسعة 
        const key = row.opportunityID;
        // ! اذا مثلا مستشفى الزاهر ماله قائمة فا هنا ننشي وحده جديدة فاضية
        if (!hospitalsMap[key]) {
            hospitalsMap[key] = {
                opportunityID: row.opportunityID,
                hospitalName: row.hospitalName,
                maleCapacity: row.maleCapacity,
                femaleCapacity: row.femaleCapacity,
                students: []
            };
        }
        // هنا نبدا نضيف الطلاب تحت كل قائمةويسوي بش لكل طالب
        hospitalsMap[key].students.push({
            studentID: row.studentID,
            firstName: row.firstName,
            lastName: row.lastName,
            gender: row.gender,
            universityGPA: row.universityGPA,
            enrolledAt: row.enrolledAt
        });
    }
// زي ماقلت احنا خليناها اوبجكت الحين نحولها اري 
    return Object.values(hospitalsMap);
};


export {
    getStudentsWithPreferences,
    getStudentPreferencesByRank,
    getOpportunitiesCapacity,
    saveAllocationPreview,
    getAllocationPreview,
    updateAllocation,
    confirmAllocation,
    getAllocatedPeriods,
    getConfirmedAllocations
};