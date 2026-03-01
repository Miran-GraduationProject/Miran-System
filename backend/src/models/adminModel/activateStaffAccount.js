import dbConnect from "../../config/dbConnect.js";

// تفعيل الحساب
const activateStaffAccount = async (userId, hashedPassword) => {
    const query = `UPDATE User SET password = '${hashedPassword}', status = 'Active', activationToken = NULL WHERE userID = ${userId}`;
    const result = await dbConnect.execute(query);
    return true;
};

export default activateStaffAccount;