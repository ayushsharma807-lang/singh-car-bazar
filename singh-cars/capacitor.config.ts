import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.CAPACITOR_SERVER_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://singhcarbazar.com";

const config: CapacitorConfig = {
  appId: "com.singhcarbazar.files",
  appName: "SCB Files",
  webDir: "public",
  server: {
    url: appUrl,
    cleartext: false,
  },
};

export default config;
