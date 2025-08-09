const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER,     // your email address
    pass: process.env.EMAIL_PASSWORD  // app password or real password (avoid real pw in prod)
  }
});

exports.sendPasswordReset = async (email, token, requestId) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"10PShine Support" <${process.env.EMAIL_USER}>`, // optional: to show sender name
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hello,</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Request ID: <strong>${requestId}</strong></p>
          <br>
          <p>— 10PShine Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('[EMAIL SEND ERROR]', error.message);
    throw new Error('Failed to send password reset email');
  }
};
