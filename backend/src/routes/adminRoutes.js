import express from 'express';
import createStaff from '../controllers/adminControllers/createStaff';
import activateAccount from '../controllers/adminControllers/activateAccount';

const router = express.Router();

router.post('/create-staff', createStaff);
router.post('/activate/:token', activateAccount);

export default router;