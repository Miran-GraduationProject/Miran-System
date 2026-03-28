import dbConnect from "../../config/dbConnect.js";
// ذا شي زيادة لكن حلو بصراحة والي هو سويت صفحة زيادة يحط فيها المستشفى الي يبغا بصفحة المنسق لان بكذا يسهل على المنسق 
// وتقدروا تقولوا انها تساعد رابع ريكوايرمنت عندنا بدال لا كل شوي يكتب المستشفيات يدوي بكل فترة يفتحها لا خلاص يجيها من الداتا الي كتبها المنسق نفسه



// يجيب  كل المستشفيات من الداتا
const getAllHospitals = async () => {
    const [rows] = await dbConnect.promise().execute(
        `SELECT hospitalID, name, location, createdAt FROM HOSPITAL ORDER BY hospitalID ASC`,
        []
    );
    return rows;
};


//  يضيف مستشفى جديد
const createHospital = async ({ name, location }) => {
    const [result] = await dbConnect.promise().execute(
        `INSERT INTO HOSPITAL (name, location, createdAt) VALUES (?, ?, NOW())`,
        [name, location]
    );
    return { hospitalID: result.insertId, name, location };
};


// يعديل مستشفى
const updateHospital = async (hospitalID, { name, location }) => {
    // أولاً نتحقق ان المستشفى موجود
    const [rows] = await dbConnect.promise().execute(
        `SELECT hospitalID FROM HOSPITAL WHERE hospitalID = ?`,
        [hospitalID]
    );
    if (!rows[0]) return { exists: false, changed: false };

    const [result] = await dbConnect.promise().execute(
        `UPDATE HOSPITAL SET name = ?, location = ? WHERE hospitalID = ?`,
        [name, location, hospitalID]
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


export { getAllHospitals, createHospital, updateHospital, deleteHospital };
