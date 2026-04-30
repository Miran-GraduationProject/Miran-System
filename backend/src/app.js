import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import dbConnect from './config/dbConnect.js';
import authRoutes from './routes/authRoutes.js';

import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';

import supervisorRoutes from './routes/supervisorRoutes.js'



dotenv.config();

const app=express();
const port=3000;

app.use(cors({
    origin:true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
    credentials: true
}));



app.use(express.json());
app.use("/api/auth",authRoutes);

app.use("/api/users",userRoutes);


app.use("/api/coordinator/training-period", coordinatorRoutes);
app.use("/api/coordinator/hospitals", hospitalRoutes);
app.use("/api/student", studentRoutes)

app.use("/api/supervisor", supervisorRoutes);



app.listen(port,()=>{
    console.log("server is running")
})

export default app;
