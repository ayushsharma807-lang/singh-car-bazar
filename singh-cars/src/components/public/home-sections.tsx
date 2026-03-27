import Link from "next/link";
import { InventoryCard } from "@/components/public/inventory-card";
import type { Listing } from "@/types";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-5xl uppercase tracking-[0.08em] text-slate-900">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
    </div>
  );
}

export function HomeSections({
  featuredListings,
}: {
  featuredListings: Listing[];
}) {
  return (
    <>
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.42em] text-[#2252e8]">
              Singh Car Bazar
            </p>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.98] tracking-[0.08em] text-slate-900 sm:text-6xl">
              Find Your Next Car Faster
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Browse live available cars, check pricing and key details, and contact our team quickly if you are ready to buy or sell.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/inventory"
                className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]"
              >
                View Inventory
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-800 transition hover:border-[#2252e8] hover:text-[#2252e8]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          ["Live Inventory", "See currently available cars first"],
          ["Quick Contact", "Call, WhatsApp, or send an inquiry fast"],
          ["Trusted Since 1993", "Used-car buying and selling in Jalandhar"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-[24px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            <p className="font-display text-3xl uppercase tracking-[0.08em] text-[#2252e8]">{value}</p>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Inventory"
            title="Featured / Latest Cars"
            description="See live available cars first. Inventory is the main focus of the website and updates from the dealer system."
          />
          <Link
            href="/inventory"
            className="inline-flex rounded-full bg-[#ff8a2e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#e17216]"
          >
            View All Cars
          </Link>
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {featuredListings.map((listing) => (
            <InventoryCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200 bg-[#f8fbff] p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
                  Quick Actions
                </p>
                <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-slate-900">
                  Ready To Buy Or Sell?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Browse all available cars or contact Singh Car Bazar directly for buying, selling, finance, or document help.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/inventory"
                  className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]"
                >
                  View All Cars
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-800 transition hover:border-[#2252e8] hover:text-[#2252e8]"
                >
                  Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
