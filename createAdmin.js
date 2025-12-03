import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/admin.js";

dotenv.config();

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedMemberPassword = await bcrypt.hash("member123", 10);

    await Admin.deleteMany(); // clears old admin records

    // Create 2 admins
    await Admin.create({ username: "chief", password: hashedAdminPassword, role: "admin" });
    await Admin.create({ username: "backup", password: hashedAdminPassword, role: "admin" });

    // Create 7 members
    const memberUsernames = ["member1","member2","member3","member4","member5","member6","member7"];
    for (const uname of memberUsernames) {
      await Admin.create({ username: uname, password: hashedMemberPassword, role: "member" });
    }

    console.log("✅ Admins and members created successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAdmin();
