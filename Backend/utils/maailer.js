import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// export const sendOTPEmail = async (to, otp) => {
//   try {
//     await transporter.sendMail({
//       from: `"GUFF 💬" <${process.env.GMAIL_USER}>`,
//       to,
//       subject: "Your GUFF Verification Code",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #1a1a2e; border-radius: 16px; color: white;">
//           <h1 style="text-align: center; color: #7c3aed;">GUFF 💬</h1>
//           <p style="text-align: center; color: #a0a0b0;">Your verification code is:</p>
//           <div style="text-align: center; margin: 24px 0;">
//             <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #7c3aed;">
//               ${otp}
//             </span>
//           </div>
//           <p style="text-align: center; color: #a0a0b0; font-size: 13px;">
//             This code expires in <strong>10 minutes</strong>
//           </p>
//           <p style="text-align: center; color: #a0a0b0; font-size: 12px;">
//             If you didn't request this, ignore this email.
//           </p>
//         </div>
//       `,
//     });

//     console.log("✅ OTP email sent");
//   } catch (err) {
//     console.log("❌ Email failed but signup continues:", err.message);
//   }
// };







const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP READY");
  }
});