import Link from "next/link";
import { notFound } from "next/navigation";
import { CarGallery } from "@/components/public/car-gallery";
import { InquiryForm } from "@/components/public/inquiry-form";
import { StatusBadge } from "@/components/public/status-badge";
import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";
import { buildListingTitle, getListingById } from "@/lib/data";
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
    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
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

  const title =
    buildListingTitle(listing) ||
    [listing.make, listing.model, listing.variant].filter(Boolean).join(" ") ||
    "Car details";

  return (
    <SiteShell currentPath="/inventory" compactFooter>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <div>
            <CarGallery
              images={listing.images}
              coverImageUrl={listing.coverImageUrl}
              title={title}
            />
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
                  {listing.make}
                </p>
                <h1 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-slate-900 sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 text-lg text-slate-600">
                  {listing.variant || `${listing.year} model`}
                </p>
              </div>
              <StatusBadge status={listing.status} />
            </div>

            <div className="mt-6 rounded-[24px] bg-[#f8fbff] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Price
              </p>
              <p className="mt-2 text-4xl font-bold text-[#2252e8]">
                {formatPrice(listing.price)}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`Hello, I want details about ${title} (${listing.numberPlate}).`)}`}
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

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
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

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
              Description
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {listing.description || "Contact Singh Car Bazar for more details about this car."}
            </p>
          </section>

          <InquiryForm
            listingId={listing.id}
            title="Send Inquiry"
            submitLabel="Request Car Details"
          />
        </div>
      </section>
    </SiteShell>
  );
}
