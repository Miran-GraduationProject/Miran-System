import e from 'express';
import express from 'express';
import {verifyToken,verifyRole} from '../middlewares/atuhMiddleware.js';

const router=express.Router();

router.get("/student",verifyToken,verifyRole("Student"),(req,res)=>{
    res.send("student route")
})

router.get("/academicSupervisor",verifyToken,verifyRole("AcademicSupervisor"),(req,res)=>{
    res.send("academic supervisor route")
})

router.get("/admin",verifyToken,verifyRole("Administrator"),(req,res)=>{
    res.send("admin route")
})

router.get("/coordintator",verifyToken,verifyRole("UniversityCoordinator"),(req,res)=>{
    res.send("coordintator route")
})

// hospital routes

router.get("/hospitalSupervisor",verifyToken,verifyRole("HospitalSupervisor"),(req,res)=>{
    res.send("hospital supervisor route")
})

router.get("/hospitalSecretary",verifyToken,verifyRole("HospitalSecretary"),(req,res)=>{
    res.send("hospital secretary route")
})

export default router;