import { PlaceholderMedia } from "@/components/public/placeholder-media";
import { SiteShell } from "@/components/public/site-shell";
import { getListings } from "@/lib/data";

export default async function GalleryPage() {
  const listings = (await getListings()).slice(0, 6);

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
          Customer deliveries, showroom highlights, and vehicle showcase blocks now use live listing photos when they are available in Supabase storage.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) =>
            listing.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={listing.id}
                src={listing.coverImageUrl}
                alt={`${listing.make} ${listing.model}`}
                className="h-[260px] w-full rounded-[28px] object-cover shadow-sm"
              />
            ) : (
              <PlaceholderMedia
                key={listing.id}
                label={`${listing.make} ${listing.model}`}
                subtitle="Live listing placeholder"
              />
            ),
          )}
        </div>
      </section>
    </SiteShell>
  );
}
