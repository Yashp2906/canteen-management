import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    // MongoDB Aggregation: Group by food_name, sum quantity and total price
    const salesData = await Order.aggregate([
      { $match: { status: "delivered" } }, // Only look at delivered items
      {
        $group: {
          _id: "$food_name",
          quantity: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$price", "$quantity"] } }
        }
      },
      { $project: { food_name: "$_id", _id: 0, quantity: 1, revenue: 1 } },
      { $sort: { quantity: -1 } } // Sort by most popular
    ]);

    return NextResponse.json(salesData);
  } catch (error) {
    console.error("Item Sales Error:", error);
    return NextResponse.json({ error: "Failed to fetch item sales" }, { status: 500 });
  }
}