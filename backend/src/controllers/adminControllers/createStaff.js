import crypto from 'crypto';
export { default as createStaffAccount } from '../../models/adminModel/createStaffAccount.js';
import { sendActivationEmail } from '../../config/emailConnect.js';

/**
 * إنشاء حساب موظف جديد
 */

const createStaff = async (req, res) => {
    const { email, role, firstName, secondName, lastName, selectedHospital } = req.body;

    // إنشاء رمز التفعيل
    const activationToken = crypto.randomBytes(32).toString('hex');
    const isExists = await findUserByEmail(email);

    // إنشاء حساب الموظف
    const newStaff = await createStaffAccount({
      email,
      role,
      firstName,
      secondName,
      lastName,
      selectedHospital,
      activationToken
    });

    // إرسال بريد التفعيل
    await sendActivationEmail(email, activationToken, role);

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: newStaff
    });
};

export default createStaff;






/**
 * const createStaff = async (req, res) => {
  try {
    const { email, role, firstName, secondName, lastName, selectedHospital } = req.body;

    // التحقق من الحقول المطلوبة
    if (!email || !role || !firstName || !lastName || !selectedHospital) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // التحقق من صحة البريد الإلكتروني حسب الدور
    if (role === 'Admin' && !email.endsWith('@uqu.edu.sa')) {
      return res.status(400).json({ message: "Admin emails must be @uqu.edu.sa" });
    }

    if ((role === 'Secretary' || role === 'Supervisor') && !email.endsWith('@Hospital.com')) {
      return res.status(400).json({ message: "Hospital staff emails must be @Hospital.com" });
    }

    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const isExists = await findUserByEmail(email);
    if (isExists) {
      return res.status(400).json({ message: "البريد الإلكتروني موجود مسبقاً" });
    }

    // إنشاء رمز التفعيل
    const activationToken = crypto.randomBytes(32).toString('hex');

    // إنشاء حساب الموظف
    const newStaff = await createStaffAccount({
      email,
      role,
      firstName,
      secondName,
      lastName,
      selectedHospital,
      activationToken
    });

    // إرسال بريد التفعيل
    await sendActivationEmail(email, activationToken, role);

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: newStaff
    });

  } catch (error) {
    console.error('Error in createStaff:', error);
    res.status(500).json({ message: "فشل في إنشاء الحساب" });
  }
};

export default createStaff;
 * 
 * 
 */
