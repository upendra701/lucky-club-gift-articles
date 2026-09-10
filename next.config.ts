import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    // Product image uploads are handled through a Server Action.
    // Allow multiple images and multipart/form-data overhead while
    // keeping the individual image validation at 5 MB in the action.
    bodySizeLimit: "20mb",
  },
};

export default nextConfig;
