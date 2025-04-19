const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

// Route
app.post("/api/contact", async (req, res) => {
  try {
    console.log("Incoming data:", req.body); // 👈 Add this line
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("❌ Error while saving message:", error.message); // 👈 Add this too
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
