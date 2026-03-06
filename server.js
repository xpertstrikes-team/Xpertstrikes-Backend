import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "https://xpertstrikes.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/admin", adminAuthRoutes);

// ✅ MongoDB Connection with optimized settings
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ✅ Routes
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚀 Xpertstrikes Backend API is running successfully!");
});

// Health check endpoint for keeping server warm
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});


// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
