import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PasswordReset from "@/models/PasswordReset";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, resetCode } = await req.json();
    
    if (!email || !resetCode) {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const reset = await PasswordReset.findOne({ email: email.toLowerCase(), resetCode });

    if (!reset) {
      return NextResponse.json({ ok: false, message: "Invalid code" }, { status: 400 });
    }

    if (reset.isUsed) {
      return NextResponse.json({ ok: false, message: "This code has already been used" }, { status: 400 });
    }

    if (reset.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, message: "Code has expired" }, { status: 400 });
    }

    // Rate-limit attempts
    reset.attempts = (reset.attempts || 0) + 1;
    if (reset.attempts > 5) {
      await reset.save();
      return NextResponse.json({ ok: false, message: "Too many attempts" }, { status: 429 });
    }
    await reset.save();

    // Generate temporary reset token (JWT)
    const payload = { email: reset.email, resetId: reset._id.toString() };
    const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

    return NextResponse.json({ ok: true, resetToken }, { status: 200 });
  } catch (error) {
    console.error("VERIFY RESET ERROR:", error);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
