// models/PasswordReset.js
import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, index: true },
  resetCode: String,                
  expiresAt: Date,
  isUsed: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 }, // to limit verification attempts
}, { timestamps: true });

// TTL index to auto-delete expired codes
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);
