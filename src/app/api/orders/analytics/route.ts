import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch only delivered orders
    const deliveredOrders = await Order.find({ status: "delivered" });

    // 2. Calculate Total Items and Revenue
    const totalItemsSold = deliveredOrders.reduce((sum, order) => sum + order.quantity, 0);
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

    return NextResponse.json({
      totalItemsSold,
      totalRevenue
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}