import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth"; 

// Generic message for incorrect password
const INVALID_CREDENTIALS_MSG = "Invalid email or password.";

// Specific message for user not found (as requested)
const USER_NOT_FOUND_MSG = "A user with this email doesn't exist. Please sign up first.";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    
    if (!email || !password) {
      return Response.json({ message: "Missing email or password." }, { status: 400 });
    }

    // 1. Check for User Existence
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // 🚨 Security Note: This message confirms the email doesn't exist, which aids user enumeration.
      // We also add a custom 'redirect: true' flag for the frontend to act upon.
      return Response.json(
        { 
          message: USER_NOT_FOUND_MSG, 
          redirect: true // Custom flag for the frontend to handle navigation
        }, 
        { status: 401 } // Still use 401 Unauthorized
      );
    }

    // 2. Compare Passwords
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      // For incorrect password, use the generic message (no redirect flag)
      return Response.json({ message: INVALID_CREDENTIALS_MSG }, { status: 401 });
    }

    // 3. Successful Login
    const token = signToken({ id: user._id });

    return Response.json({ token, message: "Login successful" }, { status: 200 });
    
  } catch (error) {
    console.error("Login API Error:", error);
    return Response.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}