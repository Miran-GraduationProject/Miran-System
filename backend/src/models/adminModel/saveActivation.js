import dbConnect from "../../config/dbConnect.js";

// حفظ رمز التفعيل
const saveActivation = async (userId, token) => {
    const query = `UPDATE User SET activationToken = '${token}', status = 'PendingActivation' WHERE userID = ${userId}`;
    const result = await dbConnect.execute(query);
    return true;
};

export default saveActivation;