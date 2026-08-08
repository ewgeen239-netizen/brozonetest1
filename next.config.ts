import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // bez tego Next szuka korzenia po lockfile'ach i potrafi wybrać katalog
  // domowy — wtedy aliasy dev-owe (metadata, instrumentation) się nie rozwiązują
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    // demo runs against remote photo CDNs; skip the optimizer so the app also
    // works offline / on static hosting without an image server
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
