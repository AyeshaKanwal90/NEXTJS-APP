import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs"; 

export async function POST(req) {
  try {
   
    await connectDB();

    
    const { 
      firstName, 
      lastName, 
      phone, 
      email, 
      password 
    } = await req.json();

   
    if (!email || !password || !firstName) {
      return Response.json(
        { message: "Missing required fields (email, password, or first name)." }, 
        { status: 400 } 
      );
    }
    
   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "A user with this email already exists." }, 
        { status: 409 } 
      );
    }

   
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

   
    const user = await User.create({ 
      firstName,
      lastName,
      phone,
      email: email.toLowerCase(), 
      password: hashedPassword 
    });
    
    
    return Response.json(
      { 
        message: "Account created successfully!",
        user: { id: user._id, email: user.email, firstName: user.firstName } 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration failed:", error);
    
    return Response.json(
      { message: "An internal server error occurred during registration." }, 
      { status: 500 } 
    );
  }
}