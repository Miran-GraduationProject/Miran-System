import { findUserByActivationToken, activateStaffAccount } from '../../models/adminModel.js';

/**
 * تفعيل حساب الموظف
 */
const activateAccount = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // البحث عن المستخدم برمز التفعيل
    const user = await findUserByActivationToken(token);

    // تفعيل الحساب
    await activateStaffAccount(user.userID, password);

    res.status(200).json({ message: "تم تفعيل الحساب بنجاح" });
};

export default activateAccount;


/**
 * const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // التحقق من وجود كلمة المرور
    if (!password) {
      return res.status(400).json({ message: "كلمة المرور مطلوبة" });
    }

    // البحث عن المستخدم برمز التفعيل
    const user = await findUserByActivationToken(token);

    if (!user) {
      return res.status(400).json({ message: "رمز التفعيل غير صحيح" });
    }

    // تفعيل الحساب
    await activateStaffAccount(user.userID, password);

    res.status(200).json({ message: "تم تفعيل الحساب بنجاح" });

  } catch (error) {
    console.error('Error in activateAccount:', error);
    res.status(500).json({ message: "فشل في تفعيل الحساب" });
  }
};

export default activateAccount;
 */