const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Error:", err.message));

// Schema & Model
const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});
const Message = mongoose.model("Message", MessageSchema);

// Email Transporter
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
    const newMessage = new Message(req.body);
    await newMessage.save();

    const mailOptions = {
      from: `"Sourav" <${process.env.EMAIL_USER}>`,
      to: req.body.email,
      subject: "Thank you for contacting me!",
      text: `Hi ${req.body.name},\n\nThank you for reaching out! I appreciate your message and will get back to you as soon as possible.\n\nBest regards,\nSourav`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("❌ Error while saving message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
