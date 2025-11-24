import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/adminModel.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashed = await bcrypt.hash("admin123", 10);

  await Admin.create({
    username: "chief",
    password: hashed,
  });

  console.log("Admin created");
  process.exit();
});
