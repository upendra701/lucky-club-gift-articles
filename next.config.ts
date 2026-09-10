import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product image uploads use a Server Action.
      // Individual files are still validated at 5 MB in the action.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
