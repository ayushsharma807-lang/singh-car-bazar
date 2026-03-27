import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/public/inquiry-form";
import { PlaceholderMedia } from "@/components/public/placeholder-media";
import { StatusBadge } from "@/components/public/status-badge";
import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";
import { getListingById } from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/utils";

type CarDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { slug } = await params;
  const listing = await getListingById(slug);

  if (!listing) {
    notFound();
  }

  const gallery = listing.images.length
    ? listing.images
    : [
        {
          id: "placeholder",
          imageUrl: "",
          sortOrder: 0,
          listingId: listing.id,
        },
      ];

  return (
    <SiteShell currentPath="/inventory">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="grid gap-5 md:grid-cols-2">
              {gallery.map((image, index) =>
                image.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image.id}
                    src={image.imageUrl}
                    alt={`${listing.make} ${listing.model} ${index + 1}`}
                    className={
                      index === 0
                        ? "h-[360px] w-full rounded-[28px] object-cover md:col-span-2"
                        : "h-52 w-full rounded-[28px] object-cover"
                    }
                  />
                ) : (
                  <PlaceholderMedia
                    key={image.id}
                    label={`${listing.make} ${listing.model}`}
                    subtitle={
                      index === 0 ? "Cover photo placeholder" : `Gallery ${index + 1}`
                    }
                    className={
                      index === 0 ? "md:col-span-2 min-h-[360px]" : "min-h-[208px]"
                    }
                  />
                ),
              )}
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#ff8a2e]">
                  {listing.make}
                </p>
                <h1 className="mt-2 font-display text-5xl uppercase tracking-[0.08em] text-slate-900">
                  {listing.model}
                </h1>
              </div>
              <StatusBadge status={listing.status} />
            </div>
            <p className="mt-3 text-lg text-slate-600">{listing.variant}</p>
            <p className="mt-5 text-4xl font-bold text-[#2252e8]">
              {formatPrice(listing.price)}
            </p>

            <div className="mt-8 grid gap-3 rounded-[24px] bg-slate-50 p-5 text-sm text-slate-600 sm:grid-cols-2">
              <p>Year: {listing.year}</p>
              <p>KM Driven: {formatNumber(listing.kmDriven)}</p>
              <p>Fuel: {listing.fuel}</p>
              <p>Transmission: {listing.transmission}</p>
              <p>Owner Count: {listing.ownerCount ?? "N/A"}</p>
              <p>Seller Type: {listing.sellerType}</p>
              <p>Location: {listing.location}</p>
              <p>Stock Number: {listing.stockNumber}</p>
            </div>

            <p className="mt-6 leading-8 text-slate-600">{listing.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`I want to inquire about ${listing.make} ${listing.model}`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950"
              >
                WhatsApp Inquiry
              </a>
              <a
                href={siteConfig.phoneHref}
                className="rounded-full bg-[#2252e8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff8a2e]">
              Seller Details
            </p>
            <div className="mt-4 grid gap-3 text-slate-600">
              <p>Name: {listing.seller?.name ?? "N/A"}</p>
              <p>Phone: {listing.seller?.phone ?? "N/A"}</p>
              <p>Type: {listing.seller?.sellerType ?? listing.sellerType}</p>
              {listing.seller?.address ? <p>Address: {listing.seller.address}</p> : null}
            </div>
          </div>
          <InquiryForm listingId={listing.id} />
        </div>
      </section>
    </SiteShell>
  );
}
