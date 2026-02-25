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