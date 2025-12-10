// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, lowercase: true },
  password: String, 
  phone: String,
  
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
