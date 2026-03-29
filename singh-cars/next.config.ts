import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

remotePatterns.push({
  protocol: "https",
  hostname: "placehold.co",
  pathname: "/**",
});

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  remotePatterns.push({
    protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
    hostname: supabaseUrl.hostname,
    pathname: "/storage/v1/object/**",
  });
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
