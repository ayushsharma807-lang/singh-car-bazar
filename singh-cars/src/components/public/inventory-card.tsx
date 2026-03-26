import Link from "next/link";
import { PlaceholderMedia } from "@/components/public/placeholder-media";
import { StatusBadge } from "@/components/public/status-badge";
import { formatNumber, formatPrice } from "@/lib/utils";
import type { Listing } from "@/types";

export function InventoryCard({ listing }: { listing: Listing }) {
  const featuredImage = listing.images.find((image) => image.isFeatured)?.imageUrl;

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      {featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={featuredImage}
          alt={`${listing.make} ${listing.model}`}
          className="h-60 w-full object-cover"
        />
      ) : (
        <PlaceholderMedia
          label={`${listing.make} ${listing.model}`}
          subtitle={listing.variant ?? listing.location}
          className="rounded-none border-0"
        />
      )}
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
              {listing.make}
            </p>
            <h3 className="font-display text-3xl uppercase tracking-[0.07em] text-slate-900">
              {listing.model}
            </h3>
            <p className="text-sm text-slate-500">{listing.variant}</p>
          </div>
          <StatusBadge status={listing.status} />
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-[22px] bg-slate-50 p-4 text-sm text-slate-600">
          <p>Year: {listing.year}</p>
          <p>Fuel: {listing.fuel}</p>
          <p>Transmission: {listing.transmission}</p>
          <p>KM: {formatNumber(listing.kmDriven)}</p>
          <p>Location: {listing.location}</p>
          <p>Stock: {listing.stockNumber}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-bold text-[#2252e8]">{formatPrice(listing.price)}</p>
          <Link
            href={`/inventory/${listing.slug}`}
            className="inline-flex rounded-full bg-[#2252e8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
