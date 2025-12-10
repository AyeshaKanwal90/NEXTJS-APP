import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

connectDB();

function verifyToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  const token = req.headers.get("authorization");
  const decoded = verifyToken(token);
  if (!decoded) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const tasks = await Task.find({ userId: decoded.id });
  return new Response(JSON.stringify(tasks), { status: 200 });
}

export async function POST(req) {
  const token = req.headers.get("authorization");
  const decoded = verifyToken(token);
  if (!decoded) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { title } = await req.json();
  if (!title || title.trim() === "") {
    return new Response(JSON.stringify({ error: "Title cannot be empty" }), { status: 400 });
  }

  const task = await Task.create({ title, userId: decoded.id });
  return new Response(JSON.stringify(task), { status: 201 });
}
