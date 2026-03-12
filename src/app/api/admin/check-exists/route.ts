import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function GET() {
  await connectDB();

  const admin = await Admin.findOne();

  return NextResponse.json({
    exists: !!admin
  });
}