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

import { checkOpenPeriodByLevel } from '../../models/coordinatorModel/openTrainingPeriod.js';


// تجيب مستوى الطالب وتشوف هل له فترة مفتوحة ولالا
const getPeriodForStudent = async (studentID) => {
    const level = await getStudentLevel(studentID);
    if (!level) return null;
    return await checkOpenPeriodByLevel(level);
};


//  نتحقق فيه ان التسجيل مفتوح ولا انتهى
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
const submitPreferences = async (req, res) => {
    try {
        const studentID = req.user.id;
        const { preferences } = req.body;

        //  نتحقق من البيانات يعني هل فبه بيانات اصلا ؟؟
        if (!preferences || preferences.length === 0) {
            return res.status(400).json({ message: "Preferences list is required" });
        }

        // تشبك على كل رغبة وتمر على كل عنصر وتتاكد من البيانات
        for (const pref of preferences) {
            if (!pref.opportunityID || !pref.preferenceRank || pref.preferenceRank < 1) {
                return res.status(400).json({ message: "Invalid preference data" });
            }
        }

        // نتحقق من التسجيل هل فيه فتره مسجله لمستوى الطالب
        const period = await getPeriodForStudent(studentID);
        if (!period) {
            return res.status(404).json({ message: "No open training period found for your level" });
        }
        // ممكن تكون فيه فتره لكن مغلقه او ماتم فتحها بعد فا احنا هنا نتاكد انها اوبن مفتوحه
        const check = checkRegistrationOpen(period);
        if (!check.open) {
            return res.status(400).json({ message: check.message });
        }

        // نتحقق ان الطالب رتب كل المستشفيات
        // يعني نشوف كم عدد المستشفيات المتاحه في هذي الفترة ونقارنها مع عدد الرغبات الي ارسلها اطالب ماينفع يسيب مستشفى مارتبه
        const availableHospitals = await getAvailableHospitals(period.periodID);
        if (preferences.length !== availableHospitals.length) {
            return res.status(400).json({
                message: `You must rank all ${availableHospitals.length} hospitals`
            });
        }

        // التحقق ان الأرقام ما تتكرر
        // بخصوص الماب اخذته من ذا الموقع https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
        const ranks = preferences.map(p => p.preferenceRank);
        const uniqueRanks = new Set(ranks);
        // set يابنات يحفظ القيم بدون تكرار تقدروا تشوفوه من الموقع الي تحت
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set او من ذا w3schools
        if (uniqueRanks.size !== ranks.length) {
            // يقارن بين القيمة الي بدون تكرار (uniqueRank) وبين الي فيها تكرار اسمها رانك 
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