import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  await connectDB();

  const orders = await Order.find({}).sort({ created_at: -1 });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const payload = await req.json();

  await connectDB();

  await Order.insertMany(payload);

  return NextResponse.json({ success: true });
}