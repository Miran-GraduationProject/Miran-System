import dbConnect from "../config/dbConnect.js";

export const FindUserByEmail= async (email) =>{
     
        const FindUser="SELECT * FROM User WHERE email=? LIMIT 1"
        const [row]=await dbConnect.promise().execute(FindUser,[email]);
        return row[0];

}

export const findUserByActivationToken = async (token) => {
  const query = `SELECT * FROM User WHERE activationToken = '${token}' AND status = 'PendingActivation'`;
    const result = await dbConnect.execute(query);
    return result[0][0];
};

// export default  {FindUserByEmail, findUserByActivationToken};