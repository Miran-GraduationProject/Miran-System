/** هذا كنترولر لخامس ريكوايرمنت 
 * عنده اربع وظائف يعرض للطالب المستشفيات المتاحه ويحفظ ترتيب الرغبات ويعرضها 
 *  وفيه ميثود تتاكد من فترةالتسجيل اذا مازالت مفتوحه وتجيبها حسب مستوى الطالب
 */
 

import {
    getAvailableHospitals,
    getStudentPreferences,
    savePreferences,
    getStudentLevel
} from '../../models/studentModel/studentPreference.js';

import { checkOpenPeriodByLevel, syncStatuses } from '../../models/coordinatorModel/openTrainingPeriod.js';


// تجيب مستوى الطالب وتشوف هل له فترة مفتوحة ولالا
/**
 * Resolves the open training period that matches the student's academic level.
 * Syncs period statuses before checking to ensure fresh state.
 *
 * @param {number} studentID
 * @returns {Promise<object|null>}
 */
const getPeriodForStudent = async (studentID) => {
    await syncStatuses();
    const level = await getStudentLevel(studentID);
    if (!level) return null;
    return await checkOpenPeriodByLevel(level);
};


//  نتحقق فيه ان التسجيل مفتوح ولا انتهى
/**
 * Checks whether the registration window is currently active.
 *
 * @param {{ registrationOpen: string, registrationClose: string }} period
 * @returns {{ open: boolean, message?: string }}
 */
const checkRegistrationOpen = (period) => {
    const now = new Date();
    if (now < new Date(period.registrationOpen)) {
        return { open: false, message: "Registration is not open yet" };
    }
    if (now > new Date(period.registrationClose)) {
        return { open: false, message: "Registration is closed" };
    }
    return { open: true };
};



//تعرض للطالب المستشفيات الي مسجلة بالفترة
/**
 * Returns available hospitals for the student's open training period.
 * Each student only sees hospitals assigned to their academic level.
 *
 * @route GET /hospitals
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getHospitals = async (req, res) => {
    try {
        const studentID = req.user.id;
        const period = await getPeriodForStudent(studentID);
        if (!period) {
            return res.status(404).json({ message: "No open training period found for your level" });
        }

        const hospitals = await getAvailableHospitals(period.periodID);

        res.status(200).json({
            periodID: period.periodID,
            periodName: period.name,
            registrationOpen: period.registrationOpen,
            registrationClose: period.registrationClose,
            hospitals
        });

    } catch (error) {
        console.error('getHospitals error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// تحفظ ترتيب الطالب  كامل وتتحقق من كلشي بعدهااا تحفظ
/**
 * Saves the student's full ranked preference list.
 * Requires all hospitals to be ranked with no duplicate ranks,
 * and the registration window must still be open.
 *
 * @route POST /preferences
 * @param {express.Request} req
 * @param {express.Response} res
 */
const submitPreferences = async (req, res) => {
    try {
        const studentID = req.user.id;
        const { preferences } = req.body;

        // نتحقق من البيانات — هل أرسل الطالب قائمة فعلاً؟
        if (!Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ message: "Preferences list is required" });
        }

        // نتحقق من كل رغبة أن فيها opportunityID ورقم ترتيب صحيح
        for (const pref of preferences) {
            if (
                !pref.opportunityID ||
                !Number.isInteger(Number(pref.preferenceRank)) ||
                Number(pref.preferenceRank) < 1
            ) {
                return res.status(400).json({ message: "Invalid preference data" });
            }
        }

        // نتحقق من التسجيل هل فيه فترة مسجلة لمستوى الطالب
        const period = await getPeriodForStudent(studentID);
        if (!period) {
            return res.status(404).json({ message: "No open training period found for your level" });
        }

        // ممكن تكون فيه فترة لكن مغلقة أو ما تم فتحها بعد
        const check = checkRegistrationOpen(period);
        if (!check.open) {
            return res.status(400).json({ message: check.message });
        }

        // نتحقق ان الطالب رتّب كل المستشفيات المتاحة بالضبط
        const availableHospitals = await getAvailableHospitals(period.periodID);
        if (preferences.length !== availableHospitals.length) {
            return res.status(400).json({
                message: `You must rank all ${availableHospitals.length} hospitals`
            });
        }

        // نتحقق أن كل مستشفى اختاره الطالب موجود فعلاً في قائمة الفترة
        const availableIDs = availableHospitals.map(h => Number(h.opportunityID));
        for (const pref of preferences) {
            if (!availableIDs.includes(Number(pref.opportunityID))) {
                return res.status(400).json({
                    message: "One or more hospitals are not available for this period"
                });
            }
        }

        // نتحقق أن أرقام الترتيب ما تتكرر
        const ranks = preferences.map(p => Number(p.preferenceRank));
        const uniqueRanks = new Set(ranks);
        if (uniqueRanks.size !== ranks.length) {
            return res.status(400).json({ message: "Preference ranks must be unique" });
        }

        const result = await savePreferences(studentID, period.periodID, preferences);

        res.status(201).json({
            message: "Preferences saved successfully",
            totalPreferences: result.totalPreferences
        });

    } catch (error) {
        console.error('submitPreferences error:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "One or more hospitals not found" });
        }

        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// الطالب يشوف ترتيبه الحالي
// يعني لو حفظ ترتيبه من قبل يقدر يشوفه
/**
 * Returns the student's currently saved preference rankings for the open period.
 *
 * @route GET /preferences
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getMyPreferences = async (req, res) => {
    try {
        const studentID = req.user.id;

        const period = await getPeriodForStudent(studentID);
        if (!period) {
            return res.status(404).json({ message: "No open training period found for your level" });
        }

        const preferences = await getStudentPreferences(studentID, period.periodID);

        res.status(200).json({
            periodID: period.periodID,
            periodName: period.name,
            preferences
        });

    } catch (error) {
        console.error('getMyPreferences error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


export { getHospitals, submitPreferences, getMyPreferences };