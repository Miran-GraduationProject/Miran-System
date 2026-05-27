import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { getHospitals, getSupervisors, addHospital, editHospital, removeHospital } from '../controllers/coordinatorControllers/hospitalController.js';

const router = express.Router();

// تجيب كل المستشفيات
router.get('/', verifyToken, verifyRole('UniversityCoordinator'), getHospitals);

// تجيب المشرفين الأكاديميين — لازم قبل /:hospitalID
router.get('/supervisors', verifyToken, verifyRole('UniversityCoordinator'), getSupervisors);

// تضيف
router.post('/', verifyToken, verifyRole('UniversityCoordinator'), addHospital);

// تعدل
router.put('/:hospitalID', verifyToken, verifyRole('UniversityCoordinator'), editHospital);

//تحذف
router.delete('/:hospitalID', verifyToken, verifyRole('UniversityCoordinator'), removeHospital);

export default router;
