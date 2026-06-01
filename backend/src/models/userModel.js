import dbConnect from "../config/dbConnect.js";


/**
 * find user by email
 *
 * gets user data from database using email
 *
 * @constant FindUserByEmail database query function
 * @requires dbConnect
 *
 * @param {string} email user email
 * @returns {Object} user object if found, undefined if not
 */
export const FindUserByEmail= async (email) =>{
     
        const FindUser="SELECT * FROM User WHERE email=? LIMIT 1"
        const [row]=await dbConnect.promise().execute(FindUser,[email]);
        return row[0];

}

