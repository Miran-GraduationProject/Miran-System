import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { getHospitals, submitPreferences, getMyPreferences } from '../controllers/studentControllers/preferenceController.js';
 import { getReport, submitReport } from "../controllers/studentControllers/reportController.js";
const router = express.Router();
//يجيب الفترة مع المستشفيات الي مسجلة جوتها
router.get('/hospitals', verifyToken, verifyRole('Student'), getHospitals);
 
// يحفظ ترتيب الرغبات
router.post('/preferences', verifyToken, verifyRole('Student'), submitPreferences);
 

// يعرضها
router.get('/preferences', verifyToken, verifyRole('Student'), getMyPreferences);
 
//---------------------------------------------
router.get("/report/:reportID", getReport);

router.post("/report/submit", submitReport);
//---------------------------------------------


export default router;