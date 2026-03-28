/* الكلاس هنا يحقق رابع ريكوايرمنت تستقبل طلبات فتح فترة جديدة وطلب تعديل مستشفى 
 *  وطلب جلب الفترة الحالية وطلب اضافة وطلب حذف مستشفى 
 *  وطلب جلب الفترة للطالب
 */


import {
    openTrainingPeriod,
    checkOpenPeriodByLevel,
    getAllOpenPeriods,
    getPeriodByID,
    updateTrainingPeriod,
    addHospitalToPeriod,
    removeHospitalFromPeriod,
    getRegistrationStats,
    deleteTrainingPeriod
} from '../../models/coordinatorModel/openTrainingPeriod.js';


// فتح فترة تدريبية جديدة
const openPeriod = async (req, res) => {
    try {
        const { name, level, startDate, endDate, registrationOpen, registrationClose, activatedBy, hospitals } = req.body;

        // لازم تكون ذي البيانات موجودة
        if (!name || !level || !startDate || !endDate || !registrationOpen || !registrationClose || !activatedBy || !hospitals || hospitals.length === 0) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // يتاكد من النواريخ 
        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        if (new Date(registrationClose) <= new Date(registrationOpen)) {
            return res.status(400).json({ message: "Registration close date must be after open date" });
        }

        // يمر على كل مستشفى ويتاكد ان ذي المعلومات موجودة 
        for (const h of hospitals) {
            if (!h.hospitalID || !h.secretaryID || h.maleCapacity < 0 || h.femaleCapacity < 0) {
                return res.status(400).json({ message: "Invalid hospital data, please check and try again" });
            }
        }

        // ذا شي زيادة صراحة انه لما يضيف المستشفيات ماتتكرر
        // ياخذ كل الاي دي تبع المستشفى ويحطهم في سيت بعدها يبدا يقارن السيت الجديدة مع الحجم الاصلي لو اختلف يعني فيه تكرار ويطلع له مسج
        const hospitalIDs = hospitals.map(h => String(h.hospitalID));
        if (new Set(hospitalIDs).size !== hospitalIDs.length) {
            return res.status(400).json({ message: "Duplicate hospitals are not allowed" });
        }

        // هنا يشوف هل لنفس المستوى اكثر من فترة ؟ لان ممنوع فالازم يشيك
        const alreadyOpen = await checkOpenPeriodByLevel(level);
        if (alreadyOpen) {
            return res.status(409).json({ message: "A training period for this level is already open" });
        }

        //اذا كل شي صح ومافي ايرور  خلاص البيانات تروح للموديل 
        const newPeriod = await openTrainingPeriod({ name, level, startDate, endDate, registrationOpen, registrationClose, activatedBy, hospitals });

        res.status(201).json({
            message: "Training period opened successfully",
            periodID: newPeriod.periodID,
            name: newPeriod.name,
            status: newPeriod.status,
            hospitalsCount: hospitals.length
        });

    } catch (error) {
        // لو صار ايرور بالتاري يجي هنا 
        // يا اما البيانات مش موجودة بالداتاس او غلط زي سكيورتي اي دي 
        // يا اما في تكرار في قيمه يونيك
        console.error('openPeriod error:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "One or more hospitals or secretaries were not found in the system" });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "This training period already exists" });
        }
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ message: "Database connection failed, please try again later" });
        }

        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


//  تعديل بيانات الفترة لما نجي نعدل ونضيف مستشفى حتكون بالميثود الي بعدها    
const editPeriod = async (req, res) => {
    try {
      
        const { periodID } = req.params;
        const { name, level, startDate, endDate, registrationOpen, registrationClose } = req.body;

        //  قبل نعدل نتاكد ان الفترة موجوده اصلا لو مو موجوده يطلع ايرور    
        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        // يتاكد ان التسجيل مافتح قبل يسمح بالتعديل علشان مايصير يعدل والطلاب قد بداو يسجلوا
        // يعني يشيك على التواريخ وكذا
        const now = new Date();
        if (now >= new Date(period.registrationOpen)) {
            return res.status(400).json({ message: "Cannot modify period after registration has opened" });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        if (new Date(registrationClose) <= new Date(registrationOpen)) {
            return res.status(400).json({ message: "Registration close date must be after open date" });
        }

        // لو كلشي كويس تحقق ذي وتطلع له رساله لو غلط بيدخل بالكاش
        const updated = await updateTrainingPeriod(periodID, { name, level, startDate, endDate, registrationOpen, registrationClose });

        res.status(200).json({
            message: "Training period updated successfully",
            periodID: updated.periodID,
            name: updated.name
        });

    } catch (error) {
        console.error('editPeriod error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


//  اضافة مستشفى لفترة اوريدي موجودة  بنفس الشرط الي قبل
const addHospital = async (req, res) => {
    try {
        const { periodID } = req.params;
        const { hospitalID, maleCapacity, femaleCapacity, secretaryID } = req.body;

        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        const now = new Date();
        if (now >= new Date(period.registrationOpen)) {
            return res.status(400).json({ message: "Cannot add hospitals after registration has opened" });
        }

        if (!hospitalID || !secretaryID || maleCapacity < 0 || femaleCapacity < 0) {
            return res.status(400).json({ message: "Invalid hospital data" });
        }

        const result = await addHospitalToPeriod(periodID, { hospitalID, maleCapacity, femaleCapacity, secretaryID });

        res.status(201).json({
            message: "Hospital added successfully",
            periodID: result.periodID,
            hospitalID: result.hospitalID
        });

    } catch (error) {
        console.error('addHospital error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "This hospital is already added to this period" });
        }

        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// نحذف  مستشفى  يتاكد من  الفترة والتواريخ
const removeHospital = async (req, res) => {
    try {
        const { periodID, hospitalID } = req.params;

        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        const now = new Date();
        if (now >= new Date(period.registrationOpen)) {
            return res.status(400).json({ message: "Cannot remove hospitals after registration has opened" });
        }

        await removeHospitalFromPeriod(periodID, hospitalID);

        res.status(200).json({
            message: "Hospital removed successfully"
        });

    } catch (error) {
        console.error('removeHospital error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// هنا بنستخدم كويري علشان نجيب احصائيات كم طالب سجل وكم بقي لكل مستشفى  لكل فترة محددة
const getRegistrationStatsController = async (req, res) => {
    try {
        const { periodID } = req.query;
        const stats = await getRegistrationStats(periodID ? Number(periodID) : null);
        if (!stats) {
            return res.status(404).json({ message: "No open training period found" });
        }
        res.status(200).json(stats);
    } catch (error) {
        console.error('getRegistrationStats error:', error);
        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};

// حذف الفترة التدريبية
const deletePeriod = async (req, res) => {
    try {
        const { periodID } = req.params;

        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        // يتاكد من التاريخ لان زي ماقلنا ماينفع نحذف او نعدل فترة قد بدا الستجيل فيها
        const now = new Date();
        if (now >= new Date(period.registrationOpen)) {
            return res.status(400).json({ message: "Cannot delete period after registration has opened" });
        }

        await deleteTrainingPeriod(periodID);

        res.status(200).json({ message: "Training period deleted successfully" });

    } catch (error) {
        console.error('deletePeriod error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


//هنا يعرض بصفحة ادارة المستشفيات كل الفترات باختصار 
const getAllPeriods = async (_req, res) => {
    try {
        const periods = await getAllOpenPeriods();
        res.status(200).json({ periods });
    } catch (error) {
        console.error('getAllPeriods error:', error);
        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


export { openPeriod, editPeriod, addHospital, removeHospital, getRegistrationStatsController, deletePeriod, getAllPeriods };
 