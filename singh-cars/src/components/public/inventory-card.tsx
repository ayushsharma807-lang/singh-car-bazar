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
    <Link href={`/inventory/${listing.id}`} className="block">
      <div className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt={title}
            className="h-56 w-full object-cover lg:h-64"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <PlaceholderMedia
            label={[listing.make, listing.model].filter(Boolean).join(" ") || "Car"}
            subtitle={listing.variant ?? listing.location}
            className="h-56 rounded-none border-0 bg-gray-50 lg:h-64"
          />
        )}
        <div className="space-y-2 p-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold leading-6 text-gray-950">{title}</h3>
              <p className="shrink-0 text-lg font-bold text-black">{formatPrice(listing.price)}</p>
            </div>
            {listing.variant ? (
              <p className="text-sm text-gray-500">{listing.variant}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>{formatNumber(listing.kmDriven)} km</span>
            <span className="text-gray-300">|</span>
            <span>{listing.year}</span>
            <span className="text-gray-300">|</span>
            <span>{listing.fuel}</span>
            <span className="text-gray-300">|</span>
            <span>{listing.transmission}</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-sm text-gray-500">{listing.location}</p>
            <span className="pointer-events-none inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition group-hover:border-gray-900">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
