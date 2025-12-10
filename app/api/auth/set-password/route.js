import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import PasswordReset from "@/models/PasswordReset";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendPasswordResetConfirmation } from "@/lib/mailer";

export async function POST(req) {
  try {
    const { resetToken, newPassword } = await req.json();
    
    // Validate input
    if (!resetToken || !newPassword) {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    await connectDB();

    // Verify JWT token
    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ ok: false, message: "Invalid or expired token" }, { status: 400 });
    }

    // Find reset record
    const reset = await PasswordReset.findById(payload.resetId);
    if (!reset) {
      return NextResponse.json({ ok: false, message: "Reset request not found" }, { status: 404 });
    }

    if (reset.isUsed) {
      return NextResponse.json({ ok: false, message: "This reset code has already been used" }, { status: 400 });
    }

    if (reset.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, message: "Reset code has expired" }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email: reset.email });
    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    // Hash and update password
    const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
    user.password = await bcrypt.hash(newPassword, rounds);
    await user.save();

    // Mark reset code as used
    reset.isUsed = true;
    await reset.save();

    // Send confirmation email (non-blocking)
    try {
      await sendPasswordResetConfirmation(user.email);
    } catch (err) {
      console.error("Password confirmation email error:", err);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ ok: true, message: "Password reset successful" }, { status: 200 });
  } catch (error) {
    console.error("SET PASSWORD ERROR:", error);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}

