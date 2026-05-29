import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config();

const dbConnect = mysql.createPool({
        
        host: 'mysql-208542-0.cloudclusters.net',
        user: 'Ghady',
        password: 'Ghady30-2025',
        port: 10123 ,
        database: 'Miran',
        ssl:{
            rejectUnauthorized: false
        }
    });

dbConnect.execute('DROP TABLE UNIVERSITY_SECRETARY', (err, results) => {
    if (err) {
        console.error('Error dropping table:', err);
    } else {
        console.log('Table UNIVERSITY_SECRETARY dropped successfully');
    }
    process.exit();
});