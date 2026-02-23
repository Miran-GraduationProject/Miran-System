import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app=express();
const port=3000;

let Connection = mysql.createConnection({
  host: process.env.DB_Host,
  user: process.env.DB_User,
  password: process.env.DB_Password,
  port:process.env.DB_Port,
  database:process.env.DB_Name

});

Connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.listen(port,()=>{
    console.log("server is running")
})