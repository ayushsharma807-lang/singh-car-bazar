import { PlaceholderMedia } from "@/components/public/placeholder-media";
import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";

export default function GalleryPage() {
  return (
    <SiteShell currentPath="/gallery">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
          Gallery
        </p>
        <h1 className="mt-3 font-display text-6xl uppercase tracking-[0.08em] text-slate-900">
          Gallery
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Customer deliveries, showroom highlights, and vehicle showcase blocks can be replaced with real photos whenever they are ready.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {siteConfig.gallery.map((item) => (
            <PlaceholderMedia key={item} label={item} subtitle="Photo placeholder" />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
