import express from 'express';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import { showSupervisedStudents } from '../controllers/SupervisorControllers/showSupervisedStudents.js';
import { searchStudents, searchStudentsByID } from '../controllers/SupervisorControllers/searchStudents.js';

import {
 createTrainingReportController,
 getTrainingPeriodsController,

} from "../controllers/SupervisorControllers/createTrainingReport.js";

import {
  getAllTemplatesController,
  getTemplateByIdController,
  getTemplateFieldsController,
  addFieldController,
  updateFieldController,
  deleteFieldController,
  createTemplateController,
  deleteTemplateController
} from "../controllers/SupervisorControllers/reportTemplate.js";

import {
  getReportController,
  getReportsController,
  getSubmissionAnswersController,
  approveSubmissionController,
  getReportStudentsController,
} from '../controllers/SupervisorControllers/reportViewController.js';

import { createCase, updateCase, deleteCase } from '../controllers/SupervisorControllers/cases.js';

const router = express.Router(); 

// حماية كاملة لكل الروابط الموجودة بحيث تتأكد انه فقط المشرف الي بيتعامل معها
router.use(verifyToken, verifyRole('AcademicSupervisor'));

router.get('/students', showSupervisedStudents);
router.get('/students/search', searchStudents);
router.get('/students/search/:studentID', searchStudentsByID);

//---------------------------------------------

// القديم: ينشئ تقرير لكل طالب
router.post('/create-report', createTrainingReportController);
router.get('/training-periods', getTrainingPeriodsController);

router.get('/templates', getAllTemplatesController);
router.get('/template/:templateID', getTemplateByIdController);
router.get('/template-fields/:templateID', getTemplateFieldsController);
router.post('/template', createTemplateController);

router.post('/field', addFieldController);
router.put('/field', updateFieldController);
router.delete('/field/:fieldID', deleteFieldController);

// عرض التقارير المنشورة للمشرف
router.get("/reports", getReportsController);

// عرض التقرير كقالب فارغ مع حقوله
router.get("/report/view/:reportID", getReportController);

// عرض كل طلاب تقرير معين: من سلّم ومن لم يسلّم
router.get("/report/:reportID/students", getReportStudentsController);

// عرض إجابات طالب معيّن
router.get("/submission/:submissionID/answers", getSubmissionAnswersController);

// موافقة المشرف على تسليم طالب
router.put("/submission/:submissionID/approve", approveSubmissionController);

//------------------------------------------------------

router.post('/cases', verifyToken, verifyRole('AcademicSupervisor'), createCase);
router.put('/cases/:caseID', verifyToken, verifyRole('AcademicSupervisor'), updateCase);
router.delete('/cases', verifyToken, verifyRole('AcademicSupervisor'),(req, res) => {return res.status(400).json({ message: "case ID is required"});} );

router.delete('/cases/:caseID', verifyToken, verifyRole('AcademicSupervisor'), deleteCase);

router.delete('/templates/:templateID', deleteTemplateController);

export default router;