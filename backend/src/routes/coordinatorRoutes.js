import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { openPeriod, editPeriod, addHospital, removeHospital, getRegistrationStatsController, deletePeriod, getAllPeriods } from '../controllers/coordinatorControllers/openPeriodController.js';
import { generatePreview, updatePreviewManually, confirmAllocationFinal, getAllocationPreviewController, getAllocatedPeriodsController, getConfirmedAllocationsController } from '../controllers/coordinatorControllers/allocationController.js';
import { getStudentPreferencesData } from '../controllers/coordinatorControllers/studentPreferencesController.js';


const router = express.Router();


//  اول حاجة نبدا من صفحة إدارة الفترات التدريبية 

//       لما ننشي فترة جديدة (فاتسوي حفظ)
router.post('/open', verifyToken, verifyRole('UniversityCoordinator'), openPeriod);

//  هنا لما ننشي ونخلص تحت تظهر كل الفترات الي سويناها لكل مستوى
router.get('/all-periods', verifyToken, verifyRole('UniversityCoordinator'), getAllPeriods);

// تعديل بيانات فترة عن طريق الايدي
router.put('/:periodID', verifyToken, verifyRole('UniversityCoordinator'), editPeriod);

// حذف فترة عن طريق الاي دي I
router.delete('/:periodID', verifyToken, verifyRole('UniversityCoordinator'), deletePeriod);

// برضوا بنفس الصفحة الي فوق لما نجي نعدل الفترة ونبغا نضيف جواتها مستشفى جديد
router.post('/:periodID/hospitals', verifyToken, verifyRole('UniversityCoordinator'), addHospital);

//نفس الي فوقها بالضبط بس هنا حذف
router.delete('/:periodID/hospitals/:hospitalID', verifyToken, verifyRole('UniversityCoordinator'), removeHospital);



//  في متابعة التسجيل 
//   هنا  (يجيب كم طالب سجل وكم تبقى)
router.get('/registration-stats', verifyToken, verifyRole('UniversityCoordinator'), getRegistrationStatsController);




//  هنا بصفحة ادارة قوائم الطلاب لما نجي نوزيع الطلاب 

//   هنا لما تبدا نوزع بالخوارزمية
router.post('/:periodID/generate-allocation', verifyToken, verifyRole('UniversityCoordinator'), generatePreview);

// تجيب نتيجة التوزيع  لفترة معينة
router.get('/:periodID/allocation-preview', verifyToken, verifyRole('UniversityCoordinator'), getAllocationPreviewController);

// نعديل التوزيع  يدوي
router.put('/:periodID/adjust-allocation/:previewID', verifyToken, verifyRole('UniversityCoordinator'), updatePreviewManually);

// نأكيد التوزيع النهائي ونحفظه
router.post('/:periodID/confirm-allocation', verifyToken, verifyRole('UniversityCoordinator'), confirmAllocationFinal);



// بيانات الطلاب ورغباتهم ومستشفياتهم لفترة معينة
router.get('/:periodID/student-preferences-data', verifyToken, verifyRole('UniversityCoordinator'), getStudentPreferencesData);



//هنا بصفحة الفرص التدريبية الموكدة

// تجيب قائمة الفترات المؤكدة عشان المنسق يختار منها(حالتها ALLOCATED)
router.get('/allocated-periods', verifyToken, verifyRole('UniversityCoordinator'), getAllocatedPeriodsController);

//  بعد ما يختار فترة تجيب قوائم الطلاب الموزعين لكل مستشفى
router.get('/:periodID/confirmed-allocations', verifyToken, verifyRole('UniversityCoordinator'), getConfirmedAllocationsController);


export default router;
