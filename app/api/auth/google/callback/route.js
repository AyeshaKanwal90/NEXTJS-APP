import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_AUTH_SECRET;
const redirectUri = "http://localhost:3000/api/auth/google/callback";

const client = new OAuth2Client(clientId, clientSecret, redirectUri);

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    let mode = "login";

    try {
      if (state) {
        const parsedState = JSON.parse(state);
        mode = parsedState.mode;
      }
    } catch (e) {
      console.error("Failed to parse state", e);
    }

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "No code provided" },
        { status: 400 }
      );
    }

  
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);


    const userInfoUri = "https://www.googleapis.com/oauth2/v2/userinfo";
    const userRes = await fetch(userInfoUri, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) throw new Error("Failed to fetch user data from Google");

    const userData = await userRes.json();
    const { email, name, picture } = userData;

    let user = await User.findOne({ email });

    if (!user && mode === "login") {
      return NextResponse.redirect(new URL("/register?error=account_not_found", req.url));
    }

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


    const dashboardUrl = new URL("/dashboard", req.url);
    dashboardUrl.searchParams.set("token", token);

    return NextResponse.redirect(dashboardUrl);

  } catch (error) {
    console.error("Google Callback Error:", error);
    return NextResponse.json(
      { ok: false, message: "Google login failed" },
      { status: 500 }
    );
  }
}
