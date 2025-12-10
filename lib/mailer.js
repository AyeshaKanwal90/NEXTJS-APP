import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function ensureEnv() {
  const missing = ["SMTP_USER", "SMTP_PASS"].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Missing SMTP env vars:", missing);
  }
}

export async function sendResetCodeEmail(to, code) {
  ensureEnv();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Code</h2>
      <p>Your password reset code is:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>Use this code to reset your password. It expires in 10 minutes.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Password Reset Code", html });
}

export async function sendPasswordResetConfirmation(to) {
  ensureEnv();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Successful</h2>
      <p>Your password has been successfully reset.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't perform this action, contact support immediately.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Password Reset Successful", html });
}

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error);
  
    if (error?.response) console.error("SMTP response:", error.response);
    throw new Error("Failed to send email");
  }
};
