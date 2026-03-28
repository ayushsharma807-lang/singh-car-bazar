import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/public/inquiry-form";
import { PlaceholderMedia } from "@/components/public/placeholder-media";
import { StatusBadge } from "@/components/public/status-badge";
import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";
import { getListingById } from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/utils";

type CarDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const images = listing.images.length
    ? listing.images
    : [
        {
          id: "placeholder",
          imageUrl: listing.coverImageUrl ?? "",
          sortOrder: 0,
          listingId: listing.id,
        },
      ];

  const mainImage = images[0];
  const extraImages = images.slice(1, 5);

  return (
    <SiteShell currentPath="/inventory">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link href="/" className="hover:text-[#2252e8]">Home</Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-[#2252e8]">Inventory</Link>
            <span>/</span>
            <span className="text-slate-900">{listing.make} {listing.model}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5">
            {mainImage?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage.imageUrl}
                alt={`${listing.make} ${listing.model}`}
                className="h-[420px] w-full rounded-[32px] object-cover shadow-sm"
              />
            ) : (
              <PlaceholderMedia
                label={`${listing.make} ${listing.model}`}
                subtitle="Main photo placeholder"
                className="min-h-[420px]"
              />
            )}

            {extraImages.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {extraImages.map((image, index) =>
                  image.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={image.id}
                      src={image.imageUrl}
                      alt={`${listing.make} ${listing.model} ${index + 2}`}
                      className="h-32 w-full rounded-[22px] object-cover shadow-sm"
                    />
                  ) : (
                    <PlaceholderMedia
                      key={image.id}
                      label={`${listing.make} ${listing.model}`}
                      subtitle={`Photo ${index + 2}`}
                      className="min-h-[128px]"
                    />
                  ),
                )}
              </div>
            ) : null}
          </div>

          <div className="grid gap-5">
            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#ff8a2e]">
                    {listing.make}
                  </p>
                  <h1 className="mt-2 font-display text-5xl uppercase tracking-[0.08em] text-slate-900">
                    {listing.model}
                  </h1>
                  <p className="mt-3 text-lg text-slate-600">
                    {listing.variant || `${listing.year} model`}
                  </p>
                </div>
                <StatusBadge status={listing.status} />
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-[24px] bg-[#f8fbff] p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Price
                  </p>
                  <p className="mt-2 text-4xl font-bold text-[#2252e8]">
                    {formatPrice(listing.price)}
                  </p>
                </div>
                <div className="grid gap-2 text-sm text-slate-600">
                  <p>Stock No: {listing.stockNumber}</p>
                  <p>Location: {listing.location}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`Hello, I want details about ${listing.make} ${listing.model} (${listing.numberPlate}).`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950"
                >
                  WhatsApp Now
                </a>
                <a
                  href={siteConfig.phoneHref}
                  className="rounded-full bg-[#2252e8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Call Now
                </a>
                <Link
                  href="/inventory"
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-800 transition hover:border-[#2252e8] hover:text-[#2252e8]"
                >
                  Back To Inventory
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#ff8a2e]">
                Quick Details
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Year" value={listing.year} />
                <DetailItem label="Number Plate" value={listing.numberPlate} />
                <DetailItem label="KM Driven" value={formatNumber(listing.kmDriven)} />
                <DetailItem label="Fuel" value={listing.fuel} />
                <DetailItem label="Transmission" value={listing.transmission} />
                <DetailItem label="Owner Count" value={listing.ownerCount} />
                <DetailItem label="Color" value={listing.color} />
                <DetailItem label="Location" value={listing.location} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div className="grid gap-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff8a2e]">
                Car Description
              </p>
              <p className="mt-5 text-base leading-8 text-slate-600">
                {listing.description || "Contact Singh Car Bazar for more details about this car, availability, and paperwork support."}
              </p>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff8a2e]">
                Dealer Support
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <DetailItem label="Finance Help" value="Available" />
                <DetailItem label="Insurance Help" value="Available" />
                <DetailItem label="Documentation" value="Handled By Team" />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff8a2e]">
                Seller Details
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Seller Name" value={listing.seller?.name} />
                <DetailItem label="Phone" value={listing.seller?.phone} />
                <div className="sm:col-span-2">
                  <DetailItem label="Address" value={listing.seller?.address} />
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-6">
            <InquiryForm
              listingId={listing.id}
              title="Send Inquiry"
              submitLabel="Request Car Details"
            />

            <section className="rounded-[28px] border border-slate-200 bg-[#f8fbff] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff8a2e]">
                Direct Contact
              </p>
              <div className="mt-4 grid gap-3 text-slate-600">
                <p>Phone: {siteConfig.phone}</p>
                <p>Email: {siteConfig.email}</p>
                <p>Address: {siteConfig.address}</p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
