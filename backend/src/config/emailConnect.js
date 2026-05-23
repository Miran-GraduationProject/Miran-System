import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// إعدادات البريد
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


// إرسال رابط التفعيل
export const sendActivationEmail = async (email, activationToken, role, userName = '') => {
    // تحديد الرابط حسب البيئة (تطوير أو إنتاج)
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const activationLink = `${baseUrl}/api/staff/activate/${activationToken}`;
    
    // تخصيص محتوى البريد حسب الدور الوظيفي
    let roleArabic = '';
    switch(role) {
      case 'Supervisor':
        roleArabic = 'مشرف مستشفى';
        break;
      default:
        roleArabic = role;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'تفعيل حسابك في المستشفى',
      html: `
        <h3>مرحباً بك</h3>
        <p>تم إنشاء حسابك بوظيفة: ${role}</p>
        <p>لتفعيل حسابك اضغط على الرابط التالي:</p>
        <a href="${activationLink}">${activationLink}</a>
        <p>الرابط صالح لمدة 24 ساعة</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('تم إرسال البريد');
    return true;
};

export default {transporter, sendActivationEmail};
