// /app/api/auth/request-reset/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { sendEmail } from "@/lib/mailer";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email is required" }, 
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowerEmail });

    if (user) {
      // Invalidate previous unused codes
      await PasswordReset.updateMany(
        { email: lowerEmail, isUsed: false },
        { $set: { isUsed: true } }
      );

      // Create new reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await PasswordReset.create({
        email: lowerEmail,
        resetCode,
        expiresAt,
        isUsed: false,
        attempts: 0,
      });

      // ✅ FIXED sendEmail call
      await sendEmail({
        to: lowerEmail,
        subject: "Your Password Reset Code",
        html: `
          <p>Your password reset verification code is:</p>
          <h2>${resetCode}</h2>
          <p>This code will expire in 10 minutes.</p>
        `,
      });
    }

    return NextResponse.json(
      { ok: true, message: "If this email is registered, a reset code has been sent" },
      { status: 200 }
    );

  } catch (error) {
    console.error("REQUEST RESET ERROR:", error);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
