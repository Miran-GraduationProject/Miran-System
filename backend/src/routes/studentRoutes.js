import express from "express";
import { verifyToken, verifyRole } from "../middlewares/atuhMiddleware.js";

import {
  getHospitals,
  submitPreferences,
  getMyPreferences,
} from "../controllers/studentControllers/preferenceController.js";

import {
  getStudentReportsController,
  getReportController,
  submitReportController,
} from "../controllers/studentControllers/reportController.js";

// جلب الحالات الإلزامية للطالب مع حالة كل حالة
import {
  getStudentCases,
} from "../controllers/studentControllers/studentCases.controller.js";

const router = express.Router();

//---------------------------------------------
// الرغبات والمستشفيات

// يجيب الفترة مع المستشفيات الي مسجلة جوتها
router.get("/hospitals", verifyToken, verifyRole("Student"), getHospitals);

// يحفظ ترتيب الرغبات
router.post("/preferences", verifyToken, verifyRole("Student"), submitPreferences);

// يعرضها
router.get("/preferences", verifyToken, verifyRole("Student"), getMyPreferences);

//---------------------------------------------
// التقارير

// يعرض كل التقارير المتاحة للطالب
router.get(
  "/reports",
  verifyToken,
  verifyRole("Student"),
  getStudentReportsController
);

// يعرض تقرير واحد حسب رقم التقرير
router.get(
  "/report/:reportID",
  verifyToken,
  verifyRole("Student"),
  getReportController
);

// تسليم التقرير
router.post(
  "/report/submit",
  verifyToken,
  verifyRole("Student"),
  submitReportController
);

//---------------------------------------------
// جلب الحالات الإلزامية للطالب مع حالة كل حالة
router.get(
  "/cases",
  verifyToken,
  verifyRole("Student"),
  getStudentCases
);

export default router;