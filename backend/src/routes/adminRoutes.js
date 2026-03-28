import express from 'express';
import createStaff from '../controllers/adminControllers/createStaff.js';
import activateAccount from '../controllers/adminControllers/activateAccount.js';
import { verifyToken, verifyRole } from '../middlewares/atuhMiddleware.js';
import dbConnect from '../config/dbConnect.js';

const router = express.Router();

router.post('/create-staff', createStaff);
router.post('/activate/:token', activateAccount);

// لان كل ترم الطالب يتغير مستواه فالادمن يقدر يعدل مستوياتهم 
router.put('/student/:studentID/level', verifyToken, verifyRole('Administrator'), async (req, res) => {
    const { studentID } = req.params;
    const { level } = req.body;
    if (!level) return res.status(400).json({ message: "Level is required" });
    const [result] = await dbConnect.promise().execute(
        `UPDATE STUDENT SET level = ? WHERE studentID = ?`,
        [level, studentID]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Level updated successfully", studentID, level });
});

export default router;