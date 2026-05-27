import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config();


/**
 * This is the actual connection pool object we will use to talk to the database
 * 
 * Created a connection pool to connect to the MySQL database and all config data are pulled from the .env file
 * 
 * @constant dbConnect MySQL connection pool
 * @requires mysql2
 * 
 *  @env DB_Host
 * @env DB_User
 * @env DB_Password
 * @env DB_Port
 * @env DB_Name
 */
    
    const dbConnect = mysql.createPool({
        
        host: process.env.DB_Host,
        user: process.env.DB_User,
        password: process.env.DB_Password,
        port:parseInt(process.env.DB_Port) ,
        database: process.env.DB_Name,
        enableKeepAlive: true,
        keepAliveInitialDelay:0,
        ssl:{
            rejectUnauthorized: false
        }
    })

 /**
 * Testing the DB connection on startup.
 * 
 * Takes a connection from the pool and releases it 
 * just to make sure the database is working
 */

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

// const poolwithPromise = dbConnect.promise();
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