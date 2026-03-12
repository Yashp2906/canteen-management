import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Food from "@/models/Food";

export const runtime = "nodejs";

export async function GET() {

  await connectDB();

  const foods = await Food.find({})
    .sort({ created_at: -1 })
    .lean();

  return NextResponse.json(foods, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600"
    }
  });
}