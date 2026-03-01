import dbConnect from "../config/dbConnect.js";

// إنشاء حساب موظف جديد
export const createStaffAccount = async (staffData) => {
  const connection = await dbConnect.promise().getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { email, role, firstName, secondName, lastName, selectedHospital, activationToken } = staffData;
    
    // Insert into User table with parameterized query
    const [userResult] = await connection.execute(
      `INSERT INTO User (email, password, role, status, activationToken, createdAt, firstName, secondName, lastName, selectedHospital) 
       VALUES (?, NULL, ?, 'PendingActivation', ?, NOW(), ?, ?, ?, ?)`,
      [email, role, activationToken, firstName, secondName || '', lastName, selectedHospital]
    );
    
    const userId = userResult.insertId;
    
    // Create record in role-specific table and generate display ID
    if (role === 'Admin') {
      await connection.execute(
        `INSERT INTO ADMINISTRATOR (adminID, displayAdminID) VALUES (?, ?)`,
        [userId, `A${userId}`]
      );
    } else if (role === 'Secretary') {
      await connection.execute(
        `INSERT INTO HOSPITAL_SECRETARY (hospitalSecretaryID, displayHospitalSecretaryID) VALUES (?, ?)`,
        [userId, `S${userId}`]
      );
    } else if (role === 'Supervisor') {
      await connection.execute(
        `INSERT INTO HOSPITAL_SUPERVISOR (hospitalSupervisorID, displayHospitalSupervisorID) VALUES (?, ?)`,
        [userId, `H${userId}`]
      );
    }
    
    await connection.commit();
    
    return {
      userID: userId,
      email: email,
      role: role,
      status: "PendingActivation"
    };
  } catch (error) {
    await connection.rollback();
    console.log("خطأ في إنشاء حساب الموظف:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// حفظ رمز التفعيل
export const saveActivationToken = async (userId, token) => {
  try {
    const query = `UPDATE User SET activationToken = '${token}', status = 'PendingActivation' WHERE userID = ${userId}`;
    const result = await dbConnect.execute(query);
    return true;
  } catch (error) {
    console.log("خطأ في حفظ رمز التفعيل:", error);
    return false;
  }
};

// البحث برمز التفعيل
export const findUserByActivationToken = async (token) => {
  try {
    const query = `SELECT * FROM User WHERE activationToken = '${token}' AND status = 'PendingActivation'`;
    const result = await dbConnect.execute(query);
    return result[0][0];
  } catch (error) {
    console.log("خطأ في البحث برمز التفعيل:", error);
  }
};

// تفعيل الحساب
export const activateStaffAccount = async (userId, hashedPassword) => {
  try {
    const query = `UPDATE User SET password = '${hashedPassword}', status = 'Active', activationToken = NULL WHERE userID = ${userId}`;
    const result = await dbConnect.execute(query);
    return true;
  } catch (error) {
    console.log("خطأ في تفعيل الحساب:", error);
    return false;
  }
};