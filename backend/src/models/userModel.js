import dbConnect from "../config/dbConnect.js";

const FindUserByEmail= async (email) =>{
     
        const FindUser="SELECT * FROM User WHERE email=? LIMIT 1"
        const [row]=await dbConnect.promise().execute(FindUser,[email]);
        return row[0];

}

export default FindUserByEmail;