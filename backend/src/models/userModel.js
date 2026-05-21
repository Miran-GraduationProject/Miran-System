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


/**
 * find user by activation token
 *
 * gets user that has pending activation using token
 *
 * @constant findUserByActivationToken database query function
 * @requires dbConnect
 *
 * @param {string} token activation token
 * @returns {Object} user object if found, undefined if not
 */
export const findUserByActivationToken = async (token) => {
  const query = `SELECT * FROM User WHERE activationToken = '${token}' AND status = 'PendingActivation'`;
    const result = await dbConnect.execute(query);
    return result[0][0];
};

// export default  {FindUserByEmail, findUserByActivationToken};