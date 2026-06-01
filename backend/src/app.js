import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";


import dbConnect from "./config/dbConnect.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import coordinatorRoutes from "./routes/coordinatorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import supervisorRoutes from "./routes/supervisorRoutes.js";
import reviewCaseRoutes from "./routes/reviewCase.routes.js";
import mandatoryCasesRoutes from "./routes/mandatoryCases.routes.js";
import logbookRoutes from "./routes/logbook.routes.js";

import helmet from "helmet";






dotenv.config();

const app=express();
const port=3000;
app.use(helmet());
/**
 * CORS configuration
 *
 * allows frontend to access backend API
 * and sets allowed methods and headers
 */
app.use(cors({
    origin:true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
    credentials: true
}));

app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-ancestors": ["'none'"],
        "form-action": ["'self'"],
      },
    },
  })
);

// Authentication & Users
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Coordinator & Hospital
app.use("/api/coordinator/training-period", coordinatorRoutes);
app.use("/api/coordinator/hospitals", hospitalRoutes);

// Student & Supervisor
app.use("/api/student", studentRoutes);
app.use("/api/supervisor", supervisorRoutes);

// Review Cases & Mandatory Cases
app.use("/api/reviewCase", reviewCaseRoutes);
app.use("/api/mandatory", mandatoryCasesRoutes);



// Logbook
app.use("/api/logbook", logbookRoutes);



// Endpoint لتحميل ملف اللوق بوك من الواجهة
app.get("/api/logbook/download/:studentId", (req, res) => {
  const { studentId } = req.params;
  const filePath = path.join(process.cwd(), "uploads", `logbook_${studentId}.pdf`);

  // تحقق إن الملف موجود
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  // إرسال الملف للتحميل
  res.download(filePath, `logbook_${studentId}.pdf`);
});


// بدء السيرفر فقط إذا لم يكن في وضع الاختبار
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log("server is running");
  });
}
//app.listen(port,()=>{
//    console.log("server is running")
//})

export default app;
