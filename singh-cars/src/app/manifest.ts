import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Singh Car Bazar Files",
    short_name: "SCB Files",
    description: "Mobile-first dealer file app for seller, car, buyer, and document workflow.",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Home",
        short_name: "Home",
        url: "/admin",
      },
      {
        name: "Files",
        short_name: "Files",
        url: "/admin/files",
      },
      {
        name: "New File",
        short_name: "New",
        url: "/admin/files/new",
      },
      {
        name: "Completed Files",
        short_name: "Done",
        url: "/admin/completed-files",
      },
    ],
  };
}
