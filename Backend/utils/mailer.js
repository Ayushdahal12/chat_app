import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // IMPORTANT for 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// IMPORTANT: verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Mailer error:", error);
  } else {
    console.log("✅ Mailer is ready");
  }
});

export const sendOTPEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"GUFF 💬" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your GUFF Verification Code",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>GUFF OTP Verification</h2>
          <h1 style="letter-spacing: 8px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", to);
  } catch (err) {
    console.log("❌ Email send failed:", err.message);
    throw new Error("Email failed");
  }
};