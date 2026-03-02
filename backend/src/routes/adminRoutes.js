import express from 'express';
import createStaff from '../controllers/adminControllers/createStaff.js';
import activateAccount from '../controllers/adminControllers/activateAccount.js';

const router = express.Router();

router.post('/create-staff', createStaff);
router.post('/activate/:token', activateAccount);

export default router;