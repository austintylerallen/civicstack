import express from "express";
import nodemailer from "nodemailer";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'austintallen07@gmail.com',
      pass: 'nvdurecvgqawfkdw'
    },
  });
  
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // TLS is used automatically on port 587
//     auth: {
//       user: process.env.EMAIL_USER?.trim(),
//       pass: process.env.EMAIL_PASS?.trim()
//     },
//   });
  

  
console.log("✅ EMAIL_USER:", process.env.EMAIL_USER);
console.log("✅ EMAIL_PASS is loaded:", !!process.env.EMAIL_PASS);

router.post("/", verifyToken, async (req, res) => {
  const { type, message } = req.body;
  const userEmail = req.user?.email || "Unknown";

  const mailOptions = {
    from: `"CivicStack Feedback" <${process.env.EMAIL_USER}>`,
    to: "austintallen07@gmail.com",
    subject: `New ${type} Feedback Submitted`,
    html: `
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Submitted by:</strong> ${userEmail}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("❌ Error sending feedback email:", err);
    res.status(500).json({ message: "Failed to send feedback" });
  }
});

export default router;
