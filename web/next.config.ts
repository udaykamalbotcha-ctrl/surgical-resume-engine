import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "cloudconvert", "@modelcontextprotocol/sdk"],
};

export default nextConfig;
