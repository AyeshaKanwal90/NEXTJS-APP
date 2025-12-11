import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";


const INVALID_CREDENTIALS_MSG = "Invalid email or password.";


const USER_NOT_FOUND_MSG = "A user with this email doesn't exist. Please sign up first.";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ message: "Missing email or password." }, { status: 400 });
    }


    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {

      return Response.json(
        {
          message: USER_NOT_FOUND_MSG,
          redirect: true
        },
        { status: 401 }
      );
    }

    // Check if user has a password (if missing, they likely used Google/Social login)
    if (!user.password) {
      return Response.json(
        { message: "This account uses Google Login. Please sign in with Google." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return Response.json({ message: INVALID_CREDENTIALS_MSG }, { status: 401 });
    }


    const token = signToken({ id: user._id });

    return Response.json({ token, message: "Login successful" }, { status: 200 });

  } catch (error) {
    console.error("Login API Error:", error);
    return Response.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}