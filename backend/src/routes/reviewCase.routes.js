// reviewCase.routes.js


import express from "express";
import {
  getReportsByStudentId,
  getReportById,  
  getFullReportById,         // الاسم الصحيح هنا
       
} from "../controllers/reviewCase.controller.js";

const router = express.Router();

// جلب تقارير طالب حسب الرقم الجامعي
router.get("/:studentId", getReportsByStudentId);

// جلب تقرير واحد حسب reportID
router.get("/report/:reportId", getReportById);

router.get("/full-report/:reportId", getFullReportById);




export default router;