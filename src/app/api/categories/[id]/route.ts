import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Food from "@/models/Food";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  console.log("Received ID:", id);

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
  }

  await Food.deleteMany({ category_id: id });
  await Category.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}