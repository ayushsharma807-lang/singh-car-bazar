"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlaceholderMedia } from "@/components/public/placeholder-media";
import { formatNumber, formatPrice } from "@/lib/utils";
import type { Listing } from "@/types";

function buildCardTitle(listing: Pick<Listing, "year" | "make" | "model" | "variant">) {
  return [listing.year, listing.make, listing.model, listing.variant]
    .filter((value) => value && String(value).trim())
    .join(" ")
    .trim();
}

function getCardImage(listing: Pick<Listing, "coverImageUrl" | "images">) {
  return listing.coverImageUrl || listing.images[0]?.imageUrl || "";
}

export function InventoryCard({ listing }: { listing: Listing }) {
  const initialImage = useMemo(() => getCardImage(listing), [listing]);
  const [imageFailed, setImageFailed] = useState(false);
  const featuredImage = imageFailed ? "" : initialImage;
  const title =
    buildCardTitle(listing) ||
    [listing.make, listing.model, listing.variant].filter(Boolean).join(" ") ||
    "Car details coming soon";

  return (
    <Link href={`/inventory/${listing.id}`} className="block h-full">
      <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt={title}
            className="h-60 w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <PlaceholderMedia
            label={[listing.make, listing.model].filter(Boolean).join(" ") || "Car"}
            subtitle={listing.variant ?? listing.location}
            className="min-h-[240px] rounded-none border-0 bg-gray-50"
          />
        )}
        <div className="flex flex-1 flex-col space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              {listing.make || "Available Car"}
            </p>
            <h3 className="text-xl font-semibold leading-7 text-gray-950">{title}</h3>
            <p className="text-2xl font-bold text-black">{formatPrice(listing.price)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
            <p>KM: {formatNumber(listing.kmDriven)}</p>
            <p>Year: {listing.year}</p>
            <p>Fuel: {listing.fuel}</p>
            <p>Gearbox: {listing.transmission}</p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Location</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{listing.location}</p>
            </div>
            <span className="pointer-events-none inline-flex rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition group-hover:border-gray-900">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
