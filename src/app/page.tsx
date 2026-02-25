import HomeClient from "./HomeClient";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

async function getFoods() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("foods")
    .select("id,name,price,image_url,status,category_id")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function Page() {
  const foods = await getFoods();
  return <HomeClient initialFoods={foods} />;
}