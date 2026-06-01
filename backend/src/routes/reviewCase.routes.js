import express from "express";
import { verifyToken, verifyRole } from "../middlewares/atuhMiddleware.js";
import {
  getReportsByStudentId,
  getReportById,
  getFullReportById,
  getAcademicSupervisors,
  updateReportStatus,
} from "../controllers/reviewCase.controller.js";

const router = express.Router();

router.get(
  "/supervisors",
  verifyToken,
  verifyRole("AcademicSupervisor"),
  getAcademicSupervisors
);
router.put(
  "/update-status/:reportId",
  verifyToken,
  verifyRole("AcademicSupervisor"),
  updateReportStatus
);

router.get("/report/:reportId", getReportById);
router.get("/full-report/:reportId", getFullReportById);
router.get("/:studentId", getReportsByStudentId);


export default router;
