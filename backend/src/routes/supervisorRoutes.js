import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { showSupervisedStudents } from '../controllers/SupervisorControllers/showSupervisedStudents.js';
import { searchStudents, searchStudentsByID } from '../controllers/SupervisorControllers/searchStudents.js';
import { createTrainingReportController } from "../controllers/SupervisorControllers/createTrainingReport.js";
import {
  getTemplateByIdController,
  getTemplateFieldsController,
  addFieldController,
  updateFieldController,
  deleteFieldController
} from "../controllers/SupervisorControllers/reportTemplate.js";
import { getReportController } from '../controllers/SupervisorControllers/reportViewController.js';

import { createCase, updateCase, deleteCase } from '../controllers/SupervisorControllers/cases.js';
const router = express.Router();


// حماية كاملة لكل الروابط الموجودة بحيث تتأكد انه فقط المشرف الي بيتعامل معها
router.use(verifyToken, verifyRole('AcademicSupervisor')); // use عشان تشغل على الكل
router.get('/students', showSupervisedStudents);
router.get('/students/search', searchStudents);
router.get('/students/search/:studentID', searchStudentsByID);

//---------------------------------------------

router.post('/create-report', createTrainingReportController);


router.get('/template/:templateID', getTemplateByIdController);
router.get('/template-fields/:templateID', getTemplateFieldsController);


router.post('/field', addFieldController);
router.put('/field', updateFieldController);
router.delete('/field/:fieldID', deleteFieldController);

router.get('/report/view/:reportID', getReportController);
//------------------------------------------------------

router.post('/cases', verifyToken, verifyRole('AcademicSupervisor'), createCase);
router.put('/cases/:caseID', verifyToken, verifyRole('AcademicSupervisor'), updateCase);
router.delete('/cases/:caseID', verifyToken, verifyRole('AcademicSupervisor'), deleteCase);

export default router;