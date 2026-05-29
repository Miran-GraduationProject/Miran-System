import express from "express";
import LogbookController from "../controllers/logbook.controller.js";

const router = express.Router();

router.get("/:studentId", LogbookController.generateLogbook);

export default router;