// server/services/emailService.js
// Dịch vụ gửi email chuyên nghiệp cho BAT Music
const nodemailer = require('nodemailer');

// Tạo transporter từ biến môi trường
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/**
 * Gửi mã xác nhận đặt lại mật khẩu với giao diện HTML thương hiệu BAT Music
 */
async function sendPasswordResetEmail(toEmail, resetCode) {
  const transporter = getTransporter();

  // Template email HTML giao diện cao cấp
  const htmlContent = `
    <div style="background-color: #07060d; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; color: #e8e0d5; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background: #15121c; border: 1px solid rgba(201,169,110,0.25); border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background: linear-gradient(135deg, #c9a96e, #e8c98a); color: #08070a; font-weight: 900; font-size: 18px; margin-bottom: 16px;">
          BAT
        </div>

        <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 10px 0; font-weight: 700;">Yêu Cầu Đặt Lại Mật Khẩu</h1>
        <p style="color: #8f88a0; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
          Bạn vừa yêu cầu mã xác nhận để đổi mật khẩu tài khoản tại <strong>BAT Music</strong>. Mã xác nhận có hiệu lực trong vòng <strong>15 phút</strong>.
        </p>

        <div style="background: rgba(201,169,110,0.1); border: 2px dashed #c9a96e; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #e8c98a;">${resetCode}</span>
        </div>

        <p style="color: #6b6480; font-size: 12px; margin: 0 0 16px 0;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này để bảo vệ tài khoản.
        </p>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;" />

        <div style="color: #4a4458; font-size: 11px;">
          © ${new Date().getFullYear()} BAT Music — Bùi Anh Tú | Producer & Beats Store
        </div>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`🔑 [EMAIL DEMO MODE] Gửi tới: ${toEmail}`);
    console.log(`🔑 [MÃ XÁC NHẬN]: ${resetCode}`);
    console.log(`ℹ️ Để gửi email thật, thêm GMAIL_USER và GMAIL_PASS vào server/.env`);
    console.log(`======================================================\n`);
    return { success: true, mode: 'demo', code: resetCode };
  }

  try {
    const info = await transporter.sendMail({
      from: `"BAT Music Support" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[BAT Music] Mã xác nhận đặt lại mật khẩu: ${resetCode}`,
      html: htmlContent,
    });
    console.log(`✅ Đã gửi email reset password tới ${toEmail}: ${info.messageId}`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Lỗi gửi email qua SMTP:`, err.message);
    return { success: false, error: err.message, code: resetCode };
  }
}

module.exports = { sendPasswordResetEmail };
