import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { showSupervisedStudents } from '../controllers/SupervisorControllers/showSupervisedStudents.js';
import { searchStudentsByName } from '../controllers/SupervisorControllers/searchStudentsController.js';

const router = express.Router();

// حماية كاملة لكل الروابط الموجودة بحيث تتأكد انه فقط المشرف الي بيتعامل معها
router.use(verifyToken, verifyRole('AcademicSupervisor')); // use عشان تشغل على الكل
router.get('/sopervisor/students', showSupervisedStudents);
router.get('/sopervisor/srudents/search', searchStudentsByName);


export default router;