export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "foods_unsigned");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dqpcl4g9m/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
}


/* ================= IMAGE DELIVERY OPTIMIZER =================
   Converts original Cloudinary URL → lightweight fast CDN URL
   5MB image becomes ~80kb automatically
============================================================== */

/* ================= IMAGE DELIVERY OPTIMIZER ================= */

export function optimizeCloudinary(url: string, width: number = 600) {
  if (!url) return url;

  if (url.includes("f_auto")) return url;

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto:eco,dpr_auto,w_${width},c_fill/`
  );
}

/* ===== BLUR PLACEHOLDER ===== */
export function cloudinaryBlur(url: string) {
  if (!url) return url;

  return url.replace(
    "/upload/",
    "/upload/w_40,e_blur:800,q_1/"
  );
}