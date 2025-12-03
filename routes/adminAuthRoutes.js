import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    const admin = await Admin.findOne(); // get single admin doc
    if (!admin) return res.status(400).json({ msg: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    return res.json({ msg: "Login successful", token });
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
      return res.json({ success: true });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// VERY IMPORTANT: EXPORT ROUTER
export default router;
