import express, { json } from "express";
import cors from "cors";
import { connect, Schema, model } from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // ✅ Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(json());

// MongoDB connection
connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err.message));

// Schema & Model
const MessageSchema = new Schema({
  name: String,
  email: String,
  message: String,
});
const Message = model("Message", MessageSchema);

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log("📩 Incoming contact form:", req.body);

    // Save to DB
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    // Send confirmation email
    const mailOptions = {
      from: `"Sourav" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting me!",
      text: `Hi ${name},\n\nThank you for reaching out! I appreciate your message and will get back to you as soon as possible.\n\nBest regards,\nSourav`,
    };

    // ✅ Send the email
    await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent");

    // Response to frontend
    res.status(201).json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
