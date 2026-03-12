import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Food from "@/models/Food";
import "@/models/Category"; // IMPORTANT (register schema)

export async function GET() {
  await connectDB();

  const foods = await Food.find({})
    .populate("category_id")
    .sort({ created_at: -1 });

  return NextResponse.json(foods);
}

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  try {
    const food = await Food.create(body);

    return NextResponse.json(food);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add food" },
      { status: 500 }
    );
  }
}