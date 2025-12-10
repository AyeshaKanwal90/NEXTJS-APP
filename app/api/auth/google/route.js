import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

export async function POST(req) {
  try {
    await connectDB();
    const { credential } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { ok: false, message: "Google client ID not configured" },
        { status: 500 }
      );
    }

    if (!credential) {
      return NextResponse.json({
        ok: false,
        message: "Google credential missing."
      });
    }

 
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    
    let user = await User.findOne({ email });

    
    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,  
        avatar: picture,
        provider: "google"
      });
    }

    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      ok: true,
      token,
      user
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { ok: false, message: "Google authentication failed" },
      { status: 500 }
    );
  }
}
