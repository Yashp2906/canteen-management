import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch the latest order
    // We sort by _id: -1 as a fallback because MongoDB ObjectIds contain the creation time
    const latestOrder = await mongoose.connection
      .collection("orders")
      .find({})
      .sort({ createdAt: -1, _id: -1 }) 
      .limit(1)
      .toArray();

    if (!latestOrder || latestOrder.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    const order = latestOrder[0];

    // 2. Return data INCLUDING the timestamp
    return NextResponse.json({
      id: order._id.toString(),
      food_name: order.food_name,
      quantity: order.quantity,
      table_no: order.table_no,
      is_department_order: order.is_department_order,
      department: order.department,
      // If your schema doesn't have createdAt, we extract it from the ObjectId
      createdAt: order.createdAt || order._id.getTimestamp(), 
    });

  } catch (error) {
    console.error("Latest order fetch error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}