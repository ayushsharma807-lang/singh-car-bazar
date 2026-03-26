import { HomeSections } from "@/components/public/home-sections";
import { SiteShell } from "@/components/public/site-shell";
import { getFeaturedListings } from "@/lib/data";

export default async function AboutPage() {
  const featuredListings = await getFeaturedListings(3);

  return (
    <SiteShell currentPath="/about">
      <HomeSections featuredListings={featuredListings} />
    </SiteShell>
  );
}
