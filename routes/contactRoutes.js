import express from "express";
import Contact from "../models/contactModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, company, email, phone, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const newContact = new Contact({
      name,
      company,
      email,
      phone,
      service,
      message,
    });

    await newContact.save();
    console.log("✅ New Contact Saved:", newContact);

    res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("❌ Error saving contact:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

export default router;
