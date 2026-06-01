import express from "express";
import MandatoryCasesController from "../controllers/mandatoryCases.controller.js";

const router = express.Router();

// المسار الأساسي
router.get("/", MandatoryCasesController.getMandatoryCases.bind(MandatoryCasesController));
router.post("/", MandatoryCasesController.addMandatoryCase.bind(MandatoryCasesController));

// مسار الاختبار
router.get("/test", MandatoryCasesController.testTable.bind(MandatoryCasesController));

export default router;
