import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { getHospitals, submitPreferences, getMyPreferences } from '../controllers/studentControllers/preferenceController.js';
 import { getReportController, submitReportController } from "../controllers/studentControllers/reportController.js";
// جلب الحالات الإلزامية للطالب مع حالة كل حالة (معلقة، مقبولة، مرفوضة، تحتاج مراجعة)
import { getStudentCases } from "../controllers/studentControllers/studentCases.controller.js";


 const router = express.Router();
//يجيب الفترة مع المستشفيات الي مسجلة جوتها
router.get('/hospitals', verifyToken, verifyRole('Student'), getHospitals);
 
// يحفظ ترتيب الرغبات
router.post('/preferences', verifyToken, verifyRole('Student'), submitPreferences);
 

// يعرضها
router.get('/preferences', verifyToken, verifyRole('Student'), getMyPreferences);
 
//---------------------------------------------
router.get("/report/:reportID", getReportController);

router.post("/report/submit", submitReportController);
//---------------------------------------------
// جلب الحالات الإلزامية للطالب مع حالة كل حالة (معلقة، مقبولة، مرفوضة، تحتاج مراجعة)
router.get("/cases", verifyToken, verifyRole('Student'), getStudentCases);

export default router;

