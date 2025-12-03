import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ msg: "Username and password required" });

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ msg: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    return res.json({
      msg: "Login successful",
      token,
      role: admin.role,
      username: admin.username,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

// VERIFY ROUTE
router.get("/verify", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, msg: "No token" });

    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, msg: "Invalid token" });

    jwt.verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
      if (err) return res.status(401).json({ success: false, msg: "Token invalid" });
      // return role for frontend
      return res.json({ success: true, role: decoded.role });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// ME route to get current admin info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("username role");
    return res.json({ success: true, admin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// REGISTER (create user) - only admin can create
router.post("/register", verifyToken, async (req, res) => {
  try {
    // only admins can create users
    if (req.user.role !== "admin") return res.status(403).json({ success: false, msg: "Forbidden" });
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, msg: "username and password required" });

    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ success: false, msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const created = await Admin.create({ username, password: hashed, role: role || "member" });
    return res.json({ success: true, user: { username: created.username, role: created.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// CHANGE PASSWORD (authenticated)
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, msg: "current and new password required" });

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, msg: "Incorrect current password" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    return res.json({ success: true, msg: "Password changed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// FORGOT PASSWORD - generate token and return URL (in prod send email)
router.post("/forgot-password", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, msg: "username required" });

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ success: false, msg: "User not found" });

    const token = crypto.randomBytes(20).toString('hex');
    admin.resetToken = token;
    admin.resetExpires = Date.now() + 3600000; // 1 hour
    await admin.save();

    // In production send email, here return the URL for convenience
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset?token=${token}&username=${encodeURIComponent(username)}`;
    return res.json({ success: true, resetUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// RESET PASSWORD using token
router.post("/reset-password", async (req, res) => {
  try {
    const { username, token, newPassword } = req.body;
    if (!username || !token || !newPassword) return res.status(400).json({ success: false, msg: "username, token and newPassword required" });

    const admin = await Admin.findOne({ username, resetToken: token, resetExpires: { $gt: Date.now() } });
    if (!admin) return res.status(400).json({ success: false, msg: "Invalid or expired token" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetToken = undefined;
    admin.resetExpires = undefined;
    await admin.save();

    return res.json({ success: true, msg: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// expose list of users - admin only
router.get("/users", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, msg: "Forbidden" });
    const users = await Admin.find().select("username role createdAt").sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// change user role - admin only
router.put("/:id/role", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, msg: "Forbidden" });
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, msg: "role required" });
    const user = await Admin.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    user.role = role;
    await user.save();
    return res.json({ success: true, user: { username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// delete user - admin only
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, msg: "Forbidden" });
    const user = await Admin.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// VERY IMPORTANT: EXPORT ROUTER
export default router;
