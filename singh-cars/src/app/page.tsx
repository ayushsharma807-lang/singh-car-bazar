import { HomeSections } from "@/components/public/home-sections";
import { SiteShell } from "@/components/public/site-shell";
import { getFeaturedListings, getListings } from "@/lib/data";

export default async function HomePage() {
  const featuredListings = await getFeaturedListings(3);
  const galleryListings = (await getListings()).slice(0, 6);

  return (
    <SiteShell currentPath="/">
      <HomeSections
        featuredListings={featuredListings}
        galleryListings={galleryListings}
      />
    </SiteShell>
  );
}
