import express from "express";
import Contact from "../models/Contact.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, company, email, phone, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const doc = await Contact.create({
      name,
      company,
      email,
      phone,
      service,
      message,
    });

    return res.status(201).json({ message: "Form submitted successfully" });
  } catch (err) {
    console.error("Contact error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET all contacts for admin
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    console.error("Contact fetch error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE a contact by id (protected - requires valid JWT in Authorization header)
router.delete("/:id", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });

    const token = auth.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, error: "Invalid token" });

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, decoded) => {
        if (err)
          return res
            .status(401)
            .json({ success: false, error: "Unauthorized" });

        // only allow if role is admin
        if (decoded.role !== "admin") {
          return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const { id } = req.params;
        const deleted = await Contact.findByIdAndDelete(id);
        if (!deleted)
          return res
            .status(404)
            .json({ success: false, error: "Contact not found" });

        return res.json({ success: true, message: "Contact deleted" });
      }
    );
  } catch (err) {
    console.error("Contact delete error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
