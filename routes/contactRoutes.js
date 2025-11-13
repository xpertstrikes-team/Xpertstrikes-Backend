import express from "express";
import Contact from "../models/Contact.js";

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

    console.log("📩 New Contact saved:", doc._id);
    return res
      .status(201)
      .json({ message: "Form submitted successfully", data: doc });
  } catch (err) {
    console.error("Contact save error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
