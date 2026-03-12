import HomeClient from "./HomeClient";
import { connectDB } from "@/lib/mongodb";
import Food from "@/models/Food";
import "@/models/Category"; // Ensure Category schema is registered for .populate()

// This tells Next.js to always fetch fresh data
export const dynamic = "force-dynamic";

async function getFoods() {
  try {
    await connectDB();

    // Fetch directly from MongoDB instead of using an internal API fetch
    const foods = await Food.find({})
      .populate("category_id")
      .sort({ created_at: -1 })
      .lean(); // .lean() makes the output a plain JS object (faster)

    // MongoDB objects contain complex types (like ObjectIds) that 
    // can't be passed directly to Client Components. 
    // This line "serializes" the data into standard JSON.
    return JSON.parse(JSON.stringify(foods));
  } catch (error) {
    console.error("Database fetch failed:", error);
    return [];
  }
}

export default async function Page() {
  const foods = await getFoods();
  
  return <HomeClient initialFoods={foods} />;
}