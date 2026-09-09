import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-avatar",
      "@radix-ui/react-tooltip",
      "sonner",
    ],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "192.168.1.49:3000", "192.168.1.49:3001", "localhost:3001"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/admin/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/signin",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/portal",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/portal/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/signup",
        permanent: false,
      },
      {
        source: "/apply",
        destination: "/admissions",
        permanent: false,
      },
      {
        source: "/admission",
        destination: "/admissions",
        permanent: false,
      },
      {
        source: "/admissions/apply",
        destination: "/admissions",
        permanent: false,
      },
      {
        source: "/fee",
        destination: "/fee-structure",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
