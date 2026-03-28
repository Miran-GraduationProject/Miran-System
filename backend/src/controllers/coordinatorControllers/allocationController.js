/** هذا الكنترولر بيحقق الريكوايرمنت السادسه الاوهي توزيع الطلاب بعد اغلاق الفترة
 * والكلاس هنا بتستقبل طلبات المنسق للتوزيع
 * المنسق بيطلب توزيع اولي وكمان بيعدل التوزيع يدوي ويعتمد التوزيع النهائي
 *  وبتتكلم مع السيرفس علشان خوارزمية التوزيع وهنا بالكلاس ثلاث امور رئيسية بتسويها  
 */

import {
    getStudentsWithPreferences,
    getStudentPreferencesByRank,
    getOpportunitiesCapacity,
    saveAllocationPreview,
    getAllocationPreview,
    updateAllocation,
    confirmAllocation,
    getAllocatedPeriods,
    getConfirmedAllocations
} from '../../models/coordinatorModel/allocationModel.js';

import { getPeriodByID } from '../../models/coordinatorModel/openTrainingPeriod.js';
import { runAllocationAlgorithm } from '../../services/allocationService.js';


//  تسوي التوزيع الأولي
const generatePreview = async (req, res) => {
    try {
        const { periodID } = req.params;

        // هل الفترة موجودة؟
        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        // هل فترة التسجيل مغلقه؟
        const now = new Date();
        if (now <= new Date(period.registrationClose)) {
            return res.status(400).json({ message: "Cannot generate allocation while registration is still open" });
        }

        // نجيب بيانات الطلاب الي سجلوا رغباتهم بذيك الفترة ويعني يشيك اذا مافي طلاب بيكون مافي شي نوزعه 
        const students = await getStudentsWithPreferences(periodID);
        if (students.length === 0) {
            return res.status(400).json({ message: "No students registered preferences for this period" });
        }

        // نجيب رغبات كل طالب
        // نبني اوبجكت اسمه رفرنس ماب 
        const preferencesMap = {};
        for (const student of students) {
            preferencesMap[student.studentID] = await getStudentPreferencesByRank(student.studentID, periodID);
        }

        // نجيب كل الفرص مع سعتها 
        const capacityMap = await getOpportunitiesCapacity(periodID);

        // نشغل الخوارزمية في السيرفس ونمرر لها ثلاث اشياءقائمنة الطلاب ورغباتهم وسعة القرصة
        const allocations = runAllocationAlgorithm(students, preferencesMap, capacityMap);

        // نحفظ النتيجة في الجدول الموقت
        await saveAllocationPreview(periodID, allocations);

        // نجيب النتائج عشان نعرضها للمنسق
        const preview = await getAllocationPreview(periodID);

        res.status(200).json({
            message: "Allocation preview generated successfully",
            periodID,
            totalStudents: students.length,
            assignedCount: allocations.filter(a => a.status === 'Assigned').length,
            unassignedCount: allocations.filter(a => a.status === 'Unassigned').length,
            // موقع شفت منه الفلتر https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
            preview
        });

    } catch (error) {
        console.error('generatePreview error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// تعديل التوزيع  يدوياً
const updatePreviewManually = async (req, res) => {
    try {
        const { periodID, previewID } = req.params;
        const { opportunityID, status } = req.body;

        // نتحقق من البيانات
        if (!status || !['Assigned', 'Unassigned'].includes(status)) {
            return res.status(400).json({ message: "Status must be Assigned or Unassigned" });
        }

        if (status === 'Assigned' && !opportunityID) {
            return res.status(400).json({ message: "opportunityID is required when status is Assigned" });
        }

        // نتحقق ان الفترة موجودة
        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        // نتحقق ان في توزيع أولي موجود
        const preview = await getAllocationPreview(periodID);
        if (preview.length === 0) {
            return res.status(400).json({ message: "No allocation preview found, generate allocation first" });
        }

        const result = await updateAllocation(previewID, opportunityID, status);

        res.status(200).json({
            message: "Allocation updated successfully",
            previewID: result.previewID,
            status: result.status
        });

    } catch (error) {
        console.error('updatePreviewManually error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// المنسق يعتمد التوزيع النهائي
const confirmAllocationFinal = async (req, res) => {
    try {
        const { periodID } = req.params;

        // نتحقق ان الفترة موجودة
        const period = await getPeriodByID(periodID);
        if (!period) {
            return res.status(404).json({ message: "Training period not found" });
        }

        // نتحقق ان في توزيع أولي موجود
        const preview = await getAllocationPreview(periodID);
        if (preview.length === 0) {
            return res.status(400).json({ message: "No allocation preview found, generate allocation first" });
        }


        // يمر على حالة كل طالب وبشوف اذا مسجل بالحدول الرفيو يضيف اسمه بالجدول النهائي
        const assignedStudents = [];

        for (const p of preview) {
            if (p.status === "Assigned") {
                assignedStudents.push(p.studentID);
            }
        }
//يخليها سيت علشان يمنع التكرار وتكون فريدة على قولتهم
        const uniqueStudents = new Set(assignedStudents);
// يقارن بين الي فيها سيت  والعدد الاصلي 
// لو اليونيك اقل من العدد الاصلي يعني فيه ناس مكررة ومسجلين باكثر من مكان
        if (uniqueStudents.size !== assignedStudents.length) {
            return res.status(400).json({
                message: "Some students have more than one assignment"
            });
        }
        const result = await confirmAllocation(periodID);

        res.status(200).json({
            message: "Allocation confirmed and saved successfully",
            periodID,
            enrolledCount: result.enrolledCount
        });

    } catch (error) {
        console.error('confirmAllocationFinal error:', error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};



// بس يشوف التوزيع الحالي
const getAllocationPreviewController = async (req, res) => {
    try {
        const { periodID } = req.params;
        const period = await getPeriodByID(periodID);
        if (!period) return res.status(404).json({ message: "Training period not found" });
        const preview = await getAllocationPreview(periodID);
        res.status(200).json({ preview });
    } catch (error) {
        console.error('getAllocationPreviewController error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


// يجيب كل الفترات  الي اكدناها
const getAllocatedPeriodsController = async (_req, res) => {
    try {
        const periods = await getAllocatedPeriods();
        res.status(200).json({ periods });
    } catch (error) {
        console.error('getAllocatedPeriodsController error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



//بتجيب لي معلومات من خلال الفترة معينة اكدناها
// المستشفيات وتحتها طلابها
const getConfirmedAllocationsController = async (req, res) => {
    try {
        const { periodID } = req.params;
        const period = await getPeriodByID(periodID);
        if (!period) return res.status(404).json({ message: "Training period not found" });
        const hospitals = await getConfirmedAllocations(periodID);
        res.status(200).json({ period, hospitals });
    } catch (error) {
        console.error('getConfirmedAllocationsController error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


export {
    generatePreview,
    updatePreviewManually,
    confirmAllocationFinal,
    getAllocationPreviewController,
    getAllocatedPeriodsController,
    getConfirmedAllocationsController
};