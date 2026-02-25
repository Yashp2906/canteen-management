import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "hsrnjsanilmilchqmxkn.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;