import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* images setting supabase aur external photos ke liye zaroori hai */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
        
      },
    ],
  },
  
  /* Agar experimental support nahi kar raha, toh pura block hata dena hi best hai */
};

export default nextConfig;