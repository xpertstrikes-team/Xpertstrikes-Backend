import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["member", "admin"],
    default: "member",
  },
  resetToken: String,
  resetExpires: Date,
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
