import dbConnect from "../../config/dbConnect.js";

// إنشاء حساب موظف جديد
const staffAccount = async (staffData) => {
    const connection = await dbConnect.promise().getConnection();
  
    await connection.beginTransaction();
    
    const { email, role, firstName, secondName, lastName, selectedHospital, activationToken } = staffData;
    
    // Insert into User table with parameterized query
    const [userResult] = await connection.execute(
      `INSERT INTO User (email, password, role, status, activationToken, createdAt, firstName, secondName, lastName, selectedHospital) 
       VALUES (?, NULL, ?, 'PendingActivation', ?, NOW(), ?, ?, ?, ?)`,
      [email, role, activationToken, firstName, secondName || '', lastName, selectedHospital]
    );
    
    const userId = userResult.insertId;
    
    await connection.commit();
    
    return {
      userID: userId,
      email: email,
      role: role,
      status: "PendingActivation"
    };
};

export default staffAccount;


/**
 * const staffAccount = async (staffData) => {
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

export default staffAccount;
 */