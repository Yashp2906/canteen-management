import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  await connectDB();

  // 🚫 Check if admin already exists
  const existingAdmin = await Admin.findOne();

  if (existingAdmin) {
    return NextResponse.json(
      { message: "Admin already registered. Registration locked." },
      { status: 403 }
    );
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new Admin({
    email,
    password: hashedPassword
  });

  await admin.save();

  return NextResponse.json({ success: true });
}