import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import dbConnect from './config/dbConnect.js';
import authRoutes from './routes/authRoutes.js';

import userRoutes from './routes/userRoutes.js';
import cors from 'cors';

//import adminRoutes from './routes/adminRoutes.js';



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



//app.use("/api/staff", adminRoutes);



app.listen(port,()=>{
    console.log("server is running")
})