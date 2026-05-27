import dbConnect from "../../config/dbConnect.js";
// ذا شي زيادة لكن حلو بصراحة والي هو سويت صفحة زيادة يحط فيها المستشفى الي يبغا بصفحة المنسق لان بكذا يسهل على المنسق 
// وتقدروا تقولوا انها تساعد رابع ريكوايرمنت عندنا بدال لا كل شوي يكتب المستشفيات يدوي بكل فترة يفتحها لا خلاص يجيها من الداتا الي كتبها المنسق نفسه



// يجيب  كل المستشفيات من الداتا
const getAllHospitals = async () => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT h.hospitalID, h.name, h.location, h.createdAt, h.supervisorID,
                u.firstName AS supervisorFirstName,
                u.lastName  AS supervisorLastName
         FROM HOSPITAL h
         LEFT JOIN \`User\` u ON u.userID = h.supervisorID
         ORDER BY h.hospitalID ASC`,
        []
    );
    return rows;
};


// يجيب كل المشرفين الأكاديميين
const getAcademicSupervisors = async () => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT userID, firstName, secondName, lastName, email
         FROM \`User\`
         WHERE role = 'AcademicSupervisor'
         ORDER BY firstName ASC, lastName ASC`,
        []
    );
    return rows;
};


//  يضيف مستشفى جديد
const createHospital = async ({ name, location, supervisorID }) => {
    const [result] = await dbConnect.promise().execute(
        `INSERT INTO HOSPITAL (name, location, supervisorID, createdAt) VALUES (?, ?, ?, NOW())`,
        [name, location, supervisorID || null]
    );
    return { hospitalID: result.insertId, name, location, supervisorID: supervisorID || null };
};


// يعديل مستشفى
const updateHospital = async (hospitalID, { name, location, supervisorID }) => {
    // أولاً نتحقق ان المستشفى موجود
    const [rows] = await dbConnect.promise().execute(
        `SELECT hospitalID FROM HOSPITAL WHERE hospitalID = ?`,
        [hospitalID]
    );
    if (!rows[0]) return { exists: false, changed: false };

    const [result] = await dbConnect.promise().execute(
        `UPDATE HOSPITAL SET name = ?, location = ?, supervisorID = ? WHERE hospitalID = ?`,
        [name, location, supervisorID || null, hospitalID]
    );
    return { exists: true, changed: result.changedRows > 0 };
};


// يحذف مستشفى
const deleteHospital = async (hospitalID) => {
    const [result] = await dbConnect.promise().execute(
        `DELETE FROM HOSPITAL WHERE hospitalID = ?`,
        [hospitalID]
    );
    return result.affectedRows > 0;
};


export { getAllHospitals, getAcademicSupervisors, createHospital, updateHospital, deleteHospital };
