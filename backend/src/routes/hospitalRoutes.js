import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { getHospitals, addHospital, editHospital, removeHospital } from '../controllers/coordinatorControllers/hospitalController.js';

const router = express.Router();

// تجيب كل المستشفيات
router.get('/', verifyToken, verifyRole('UniversityCoordinator'), getHospitals);

// تضيف
router.post('/', verifyToken, verifyRole('UniversityCoordinator'), addHospital);

// تعدل
router.put('/:hospitalID', verifyToken, verifyRole('UniversityCoordinator'), editHospital);

//تحذف
router.delete('/:hospitalID', verifyToken, verifyRole('UniversityCoordinator'), removeHospital);

export default router;
