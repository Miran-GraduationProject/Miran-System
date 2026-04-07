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
    })    
    // const dbConnect = mysql.createPool({
        
    //     host: process.env.DB_Host,
    //     user: process.env.DB_User,
    //     password: process.env.DB_Password,
    //     port:parseInt(process.env.DB_Port) ,
    //     database: process.env.DB_Name,
    //     ssl:{
    //         rejectUnauthorized: false
    //     }
    // })

    dbConnect.getConnection((err, connection) => {
        if(err){
            console.error('Error connecting to the database:', err);
        }else{
            console.log('Connected to the database!');
            connection.release();
        }
    }
)

//   Connection.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
// });


export default dbConnect;

// const Connection = mysql.createConnection ({

//         host: process.env.DB_Host,
//         user: process.env.DB_User,
//         password: process.env.DB_Password,
//         port: process.env.DB_Port,
//         database: process.env.DB_Name,
//   });

//   Connection.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
// });
   
// export default Connection;


