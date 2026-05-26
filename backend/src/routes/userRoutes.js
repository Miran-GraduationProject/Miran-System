import e from 'express';
import express from 'express';
import {verifyToken,verifyRole} from '../middlewares/atuhMiddleware.js';

const router=express.Router();


/**
 * Role-based protected routes
 *
 * all routes here are protected using:
 * - verifyToken (authentication)
 * - verifyRole (authorization based on user role)
 *
 * each route returns a simple message based on role access
 */
router.get("/student",verifyToken,verifyRole("Student"),(req,res)=>{
    res.send("student route")
})

router.get("/academicSupervisor",verifyToken,verifyRole("AcademicSupervisor"),(req,res)=>{
    res.send("academic supervisor route")
})



router.get("/coordintator",verifyToken,verifyRole("UniversityCoordinator"),(req,res)=>{
    res.send("coordintator route")
})





export default router;