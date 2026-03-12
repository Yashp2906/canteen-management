import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function DELETE() {
  try {
    await connectDB();

    // This permanently deletes all orders from the 'orders' collection 
    // that have the status 'delivered'
    const result = await Order.deleteMany({ status: "delivered" });

    console.log(`Successfully deleted ${result.deletedCount} delivered orders.`);

    return NextResponse.json({ 
      success: true, 
      message: `${result.deletedCount} orders cleared from database.` 
    });
    
  } catch (error) {
    console.error("Archive Error:", error);
    return NextResponse.json(
      { error: "Failed to clear database records" }, 
      { status: 500 }
    );
  }
}