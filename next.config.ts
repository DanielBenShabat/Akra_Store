import type { NextConfig } from "next";
import * as os from "node:os";

// Discover the machine's current non-internal IPv4 addresses so LAN dev origins
// stay valid as the local IP changes, instead of hardcoding network IPs.
function localDevOrigins(): string[] {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter(
      (net): net is os.NetworkInterfaceInfo =>
        !!net && net.family === "IPv4" && !net.internal,
    )
    .map((net) => net.address);

  return ["localhost", "127.0.0.1", ...new Set(addresses)];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: localDevOrigins(),
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
