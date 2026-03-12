import HomeClient from "./HomeClient";

export const revalidate = 60;

async function getFoods() {
 const res = await fetch(
  "http://localhost:3000/api/foods",
  { cache: "no-store" }
);

  const data = await res.json();

  return data ?? [];
}

export default async function Page() {
  const foods = await getFoods();
  return <HomeClient initialFoods={foods} />;
}