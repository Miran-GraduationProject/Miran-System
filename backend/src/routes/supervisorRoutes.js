import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { showSupervisedStudents } from '../controllers/SupervisorControllers/showSupervisedStudents.js';
import { searchStudents } from '../controllers/SupervisorControllers/searchStudents.js';
import { createTrainingReport } from "../controllers/SupervisorControllers/createTrainingReport.js";
import {getTemplateById, getTemplateFields, getSupervisorReport, addReportField, updateReportField, deleteReportField } from "../controllers/SupervisorControllers/reportTemplate.js";

const router = express.Router();

// حماية كاملة لكل الروابط الموجودة بحيث تتأكد انه فقط المشرف الي بيتعامل معها
router.use(verifyToken, verifyRole('AcademicSupervisor')); // use عشان تشغل على الكل
router.get('/students', showSupervisedStudents);
router.get('/students/search', searchStudents);
//---------------------------------------------
router.post("/create-report", createTrainingReport);   // مسار لإنشاء تقرير تدريب للطلاب (يستدعي دالة إنشاء التقرير) 
//  جلب بيانات التمبلت
router.get("/template/:templateID", getTemplateById);
// جلب الحقول الخاصة بالتمبلت 
router.get("/template-fields/:templateID", getTemplateFields);
// اضافه حقل في التمبلت
router.post("/field", addReportField); 
// تعديل الحقل في التمبلت
router.put("/field", updateReportField);
//يحذف الحقل من التمبلت
router.delete("/field/:fieldID", deleteReportField);
router.get("/report/view/:reportID", getSupervisorReport);
//---------------------------------------------


export default router;