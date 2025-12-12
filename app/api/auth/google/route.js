import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "login";


    const state = JSON.stringify({ mode });

    const authorizeUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ],
      redirect_uri: redirectUri,
      state: state
    });

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { ok: false, message: "Google authentication failed" },
      { status: 500 }
    );
  }
}
