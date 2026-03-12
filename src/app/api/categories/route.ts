import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  await connectDB();

  const categories = await Category.find({}).sort({ created_at: -1 });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  try {
    const category = await Category.create(body);

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}