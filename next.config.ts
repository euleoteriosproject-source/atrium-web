import type { NextConfig } from "next";

const allowedDevOrigins =
  process.env.NODE_ENV === "development"
    ? (process.env.ALLOWED_DEV_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
