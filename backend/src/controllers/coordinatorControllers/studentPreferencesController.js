import dbConnect from '../../config/dbConnect.js';

// تجيب كل الطلاب مع رغباتهم وأسماء المستشفيات لفترة معينة
// للمنسق عشان يشوف من سجّل وما سجّل
const getStudentPreferencesData = async (req, res) => {
    try {
        const { periodID } = req.params;

        if (!periodID) {
            return res.status(400).json({ message: "periodID is required" });
        }

        const [results] = await dbConnect.promise().execute(
            `SELECT
                u.userID AS studentID,
                u.firstName,
                u.lastName,
                u.gender,
                s.universityGPA,
                p.name AS periodName,
                h.name AS hospitalName,
                opp.opportunityID,
                pref.preferenceRank
             FROM STUDENT_PREFERENCE pref
             INNER JOIN \`User\` u ON pref.studentID = u.userID
             INNER JOIN STUDENT s ON s.studentID = u.userID
             INNER JOIN TRAINING_PERIOD p ON pref.periodID = p.periodID
             INNER JOIN TRAINING_OPPORTUNITY opp ON pref.opportunityID = opp.opportunityID
             INNER JOIN HOSPITAL h ON opp.hospitalID = h.hospitalID
             WHERE pref.periodID = ?
             ORDER BY u.firstName, pref.preferenceRank`,
            [periodID]
        );

        res.status(200).json({ periodID, students: results });

    } catch (error) {
        console.error('getStudentPreferencesData error:', error);
        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};

export { getStudentPreferencesData };
