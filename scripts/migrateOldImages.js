require("dotenv").config();
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function migrate() {
  const { data: foods } = await supabase
    .from("foods")
    .select("*");

  for (const food of foods) {
    if (!food.image_url || food.image_public_id) continue;

    console.log("Migrating:", food.name);

    const response = await axios.get(food.image_url, {
      responseType: "arraybuffer",
    });

    const upload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${Buffer.from(response.data).toString("base64")}`,
      {
        folder: "foods",
      }
    );

    await supabase
      .from("foods")
      .update({
        image_url: upload.secure_url,
        image_public_id: upload.public_id,
      })
      .eq("id", food.id);

    console.log("Done:", food.name);
  }

  console.log("Migration complete");
}

migrate();