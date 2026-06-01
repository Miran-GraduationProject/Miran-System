/* الكلاس هنا يحقق رابع ريكوايرمنت تستقبل طلبات فتح فترة جديدة وطلب تعديل مستشفى 
 *  وطلب جلب الفترة الحالية وطلب اضافة وطلب حذف مستشفى 
 *  وطلب جلب الفترة للطالب
 */


import {
    syncStatuses,
    openTrainingPeriod,
    checkOpenPeriodByLevel,
    getAllPeriods as fetchAllPeriods,
    getPeriodByID,
    getLinkedHospitalIDs,
    updatePeriodWithCapacities,
    addHospitalToPeriod,
    removeHospitalFromPeriod,
    getRegistrationStats,
    deleteTrainingPeriod
} from '../../models/coordinatorModel/openTrainingPeriod.js';


// فتح فترة تدريبية جديدة
/**
 * Creates a new training period linked to the given hospitals.
 * Blocks creation if another period for the same level is already open,
 * or if date ranges are invalid or hospitals are duplicated.
 *
 * @route POST /open
 * @param {express.Request} req
 * @param {express.Response} res
 */
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

        if (new Date(registrationClose) >= new Date(startDate)) {
            return res.status(400).json({ message: "Registration must close before training starts" });
        }

        // يمر على كل مستشفى ويتاكد ان ذي المعلومات موجودة
        for (const h of hospitals) {
            if (!h.hospitalID || h.maleCapacity < 0 || h.femaleCapacity < 0) {
                return res.status(400).json({ message: "Invalid hospital data, please check and try again" });
            }
        }

        // ذا شي زيادة صراحة انه لما يضيف المستشفيات ماتتكرر
        // ياخذ كل الاي دي تبع المستشفى ويحطهم في سيت بعدها يبدا يقارن السيت الجديدة مع الحجم الاصلي لو اختلف يعني فيه تكرار ويطلع له مسج
        const hospitalIDs = hospitals.map(h => String(h.hospitalID));
        if (new Set(hospitalIDs).size !== hospitalIDs.length) {
            return res.status(400).json({ message: "Duplicate hospitals are not allowed" });
        }

        // نغلق الفترات المنتهية تلقائياً قبل التحقق — يمنع تعارض الفترات المنتهية مع الجديدة
        await syncStatuses();

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
        // لو صار ايرور بالتاريخ يجي هنا 
        // يا اما البيانات مش موجودة بالداتا او غلط زي سكيورتي اي دي 
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
/**
 * Updates an existing training period's details.
 * Locked once registration opens — any attempt after that returns 400.
 *
 * @route PUT /:periodID
 * @param {express.Request} req
 * @param {express.Response} res
 */
const editPeriod = async (req, res) => {
    try {

        const { periodID } = req.params;
        const { name, level, startDate, endDate, registrationOpen, registrationClose, hospitals } = req.body;
        //  قبل نعدل نتاكد ان الفترة موجوده اصلا لو مو موجوده يطلع ايرور
        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

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

        if (new Date(registrationClose) >= new Date(startDate)) {
            return res.status(400).json({ message: "Registration must close before training starts" });
        }

        // التحقق من صحة بيانات المستشفيات لو تم إرسالها
        let validatedHospitals = [];
        if (hospitals !== undefined) {
            if (!Array.isArray(hospitals)) {
                return res.status(400).json({ message: "Hospitals must be an array" });
            }
            for (const h of hospitals) {
                if (!h.hospitalID) {
                    return res.status(400).json({ message: "Each hospital must have a hospitalID" });
                }
                const mc = Number(h.maleCapacity);
                const fc = Number(h.femaleCapacity);
                if (isNaN(mc) || isNaN(fc) || mc < 0 || fc < 0) {
                    return res.status(400).json({ message: "Hospital capacities must be valid numbers >= 0" });
                }
                validatedHospitals.push({ hospitalID: h.hospitalID, maleCapacity: mc, femaleCapacity: fc });
            }

            // نتأكد أن كل hospitalID ينتمي لهذي الفترة قبل أي تعديل
            if (validatedHospitals.length > 0) {
                const linkedIDs = await getLinkedHospitalIDs(periodID);
                for (const h of validatedHospitals) {
                    if (!linkedIDs.includes(Number(h.hospitalID))) {
                        return res.status(400).json({ message: `Hospital ${h.hospitalID} is not linked to this period` });
                    }
                }
            }
        }

        // تحديث الفترة وسعات المستشفيات في معاملة واحدة
        const updated = await updatePeriodWithCapacities(
            periodID,
            { name, level, startDate, endDate, registrationOpen, registrationClose },
            validatedHospitals
        );

        res.status(200).json({
            message: "Training period updated successfully",
            periodID: updated.periodID,
            name: updated.name
        });

    } catch (error) {
        console.error('editPeriod error:', error);
        if (error.code === 'NO_ROWS_MATCHED') {
            return res.status(400).json({ message: "One or more hospitals could not be updated — hospital may not be linked to this period" });
        }
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


//  اضافة مستشفى لفترة اوريدي موجودة  بنفس الشرط الي قبل
/**
 * Adds a hospital to an existing period before registration opens.
 * Returns 400 if the hospital is already linked to this period.
 *
 * @route POST /:periodID/hospitals
 * @param {express.Request} req
 * @param {express.Response} res
 */
const addHospital = async (req, res) => {
    try {
        const { periodID } = req.params;
        const hospital = req.body;

        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        const now = new Date();
        if (now >= new Date(period.registrationOpen)) {
            return res.status(400).json({ message: "Cannot modify hospitals after registration has opened" });
        }

        const { hospitalID, maleCapacity, femaleCapacity } = hospital;
        if (!hospitalID || maleCapacity < 0 || femaleCapacity < 0) {
            return res.status(400).json({ message: "Invalid hospital data" });
        }

        const result = await addHospitalToPeriod(periodID, hospital);

        return res.status(201).json({
            message: "Hospital added successfully",
            periodID: result.periodID,
            hospitalID: result.hospitalID
        });
    } catch (error) {
        console.error("addHospital error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "This hospital is already added to this period" });
        }

        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// نحذف  مستشفى  يتاكد من  الفترة والتواريخ
/**
 * Removes a hospital from a period before registration opens.
 *
 * @route DELETE /:periodID/hospitals/:hospitalID
 * @param {express.Request} req
 * @param {express.Response} res
 */
const removeHospital = async (req, res) => {
    try {
        const { periodID, hospitalID } = req.params;

        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        const now = new Date();
        if (now >= new Date(period.registrationOpen)) {
            return res.status(400).json({ message: "Cannot modify hospitals after registration has opened" });
        }

        const removed = await removeHospitalFromPeriod(periodID, hospitalID);

        if (!removed) {
            return res.status(404).json({ message: "Hospital not found in this period" });
        }

        res.status(200).json({
            message: "Hospital removed successfully"
        });

    } catch (error) {
        console.error('removeHospital error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// هنا بنستخدم كويري علشان نجيب احصائيات كم طالب سجل وكم بقي لكل مستشفى  لكل فترة محددة
/**
 * Returns per-hospital registration counts for a given period.
 * If no periodID is passed in the query, defaults to the currently open period.
 *
 * @route GET /registration-stats?periodID=
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getRegistrationStatsController = async (req, res) => {
    try {
        const { periodID } = req.query;
        let stats;
        if (periodID) {
            stats = await getRegistrationStats(Number(periodID));
        } else {
            stats = await getRegistrationStats(null);
        }
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
/**
 * Permanently deletes a training period.
 * Blocked once registration opens to protect already-submitted preferences.
 *
 * @route DELETE /:periodID
 * @param {express.Request} req
 * @param {express.Response} res
 */
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


//هنا يعرض بصفحة الفترات التدريبية كل الفترات باختصار
/**
 * Returns a summary list of all training periods regardless of status.
 *
 * @route GET /all-periods
 * @param {express.Request} _req
 * @param {express.Response} res
 */
const getAllPeriods = async (_req, res) => {
    try {
        const periods = await fetchAllPeriods();
        res.status(200).json({ periods });
    } catch (error) {
        console.error('getAllPeriods error:', error);
        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


export { openPeriod, editPeriod, addHospital, removeHospital, getRegistrationStatsController, deletePeriod, getAllPeriods };
 