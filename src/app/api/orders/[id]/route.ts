import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
// Add PATCH export along with your existing DELETE export
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await mongoose.connection
      .collection("orders")
      .updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { status: status } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Keep your existing export async function DELETE(...) below this
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    // In Next.js 15+, params is a Promise and must be awaited
    const { id } = await params;

    console.log("Deleting order id:", id);

    // Validate if the ID is a valid MongoDB ObjectId to prevent crashing
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Order ID format" },
        { status: 400 }
      );
    }

    const result = await mongoose.connection
      .collection("orders")
      .deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    console.log("DELETE RESULT:", result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order deleted successfully" 
    });

  } catch (error) {
    console.error("Delete error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}