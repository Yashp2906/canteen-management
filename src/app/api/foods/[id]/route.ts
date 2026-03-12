import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Food from "@/models/Food";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  console.log("Deleting food id:", id);

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid food ID" }, { status: 400 });
  }

  try {
    const deleted = await Food.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Food delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete food" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;
  const body = await req.json();

  console.log("Updating food status:", id);

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid food ID" }, { status: 400 });
  }

  try {
    const updated = await Food.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Food status update error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}