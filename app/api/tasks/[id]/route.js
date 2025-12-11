import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const token = req.headers.get("authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
        }

        const deletedTask = await Task.findOneAndDelete({ _id: id, userId: decoded.id });

        if (!deletedTask) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
