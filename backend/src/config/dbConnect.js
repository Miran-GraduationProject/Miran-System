import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// إنشاء اتصال مع قاعدة البيانات باستخدام Pool
const dbConnect = mysql.createPool({
host: 'mysql-208542-0.cloudclusters.net',
        user: 'Ghady',
        password: 'Ghady30-2025',
        port: 10123 ,
        database: 'Miran',
        ssl:{
            rejectUnauthorized: false
        }
            })

// اختبار الاتصال
dbConnect.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to the database:", err);
  } else {
    console.log("✅ Connected to the database successfully!");
    connection.release();
  }
});

export default dbConnect;

