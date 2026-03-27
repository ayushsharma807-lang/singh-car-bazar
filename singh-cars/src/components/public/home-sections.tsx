import Link from "next/link";
import { siteConfig } from "@/config/site";
import { InquiryForm } from "@/components/public/inquiry-form";
import { InventoryCard } from "@/components/public/inventory-card";
import { PlaceholderMedia } from "@/components/public/placeholder-media";
import { formatNumber } from "@/lib/utils";
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
  galleryListings,
}: {
  featuredListings: Listing[];
  galleryListings: Listing[];
}) {

  return (
    <>
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.42em] text-[#2252e8]">
              Welcome to Singh Car Bazar
            </p>
            <h1 className="mt-4 font-display text-6xl uppercase leading-[0.95] tracking-[0.08em] text-slate-900 sm:text-7xl">
              Buying and Selling Pre-Owned Cars
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A cleaner, more modern version of the current Singh Car Bazar website, with live inventory managed from your own database and dealer system.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/inventory"
                className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]"
              >
                Buy Now
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[#ff8a2e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8a2e] transition hover:bg-[#ff8a2e] hover:text-white"
              >
                Sell Now
              </Link>
            </div>
          </div>
          <div className="grid gap-5">
            <PlaceholderMedia label="Featured Inventory" subtitle="Live database feed" className="min-h-[320px]" />
            <div className="grid gap-5 md:grid-cols-2">
              <Link
                href="/inventory"
                className="rounded-[28px] bg-[#2252e8] p-6 text-white shadow-[0_25px_60px_rgba(34,82,232,0.22)] transition hover:scale-[1.02] hover:shadow-[0_30px_70px_rgba(34,82,232,0.28)]"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-white/80">To Buy Car</p>
                <h3 className="mt-3 font-display text-3xl uppercase tracking-[0.08em]">
                  At Reasonable Price
                </h3>
                <p className="mt-3 text-white/85">Click to view available cars from the live inventory.</p>
              </Link>
              <Link
                href="/contact"
                className="rounded-[28px] bg-[#ff8a2e] p-6 text-white shadow-[0_25px_60px_rgba(255,138,46,0.22)] transition hover:scale-[1.02] hover:shadow-[0_30px_70px_rgba(255,138,46,0.28)]"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-white/80">Want To Sell Your Car?</p>
                <h3 className="mt-3 font-display text-3xl uppercase tracking-[0.08em]">
                  At Reasonable Price
                </h3>
                <p className="mt-3 text-white/85">Fill car details and we will help you close the right deal.</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-3 lg:grid-cols-4 lg:px-8">
        {[
          ["500+", "Vehicles Handled"],
          ["300+", "Active Buyer Leads"],
          ["30+", "Cities Reached"],
          ["1993", "Established"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-[24px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            <p className="font-display text-5xl uppercase tracking-[0.08em] text-[#2252e8]">{value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Services"
          title="Services We Offer"
          description="The public website stays familiar, while the backend powers live listings, inquiries, and dealer operations."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {siteConfig.services.map((service) => (
            <article key={service.title} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#2252e8]">
                Service
              </p>
              <h3 className="mt-5 font-display text-3xl uppercase tracking-[0.08em] text-slate-900">
                {service.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <PlaceholderMedia label="About Singh Car Bazar" subtitle="Showroom and customer trust" className="min-h-[420px]" />
          <div className="flex flex-col justify-center">
            <SectionHeading
              eyebrow="About Us"
              title="Serving Buyers and Sellers Since 1993"
              description="Singh Car Bazar is known in Jalandhar for practical used-car deals, responsive support, and smoother paperwork. This rebuild keeps the familiar public-facing feel but replaces static content with a live inventory system."
            />
            <div className="mt-8 grid gap-4">
              {[
                "Live stock management for available, booked, and sold cars",
                "Seller, buyer, inquiry, and document details managed in one place",
                "Public inventory pages connected directly to your own database",
              ].map((item) => (
                <div key={item} className="rounded-[22px] bg-slate-50 px-5 py-4 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Inventory"
            title="Featured / Latest Cars"
            description="These cards are sourced from the database layer so the homepage can stay fresh whenever the inventory is updated."
          />
          <Link
            href="/inventory"
            className="inline-flex rounded-full bg-[#ff8a2e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#e17216]"
          >
            All Cars
          </Link>
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {featuredListings.map((listing) => (
            <InventoryCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Gallery"
            title="Gallery / Customer Delivery"
            description="A delivery and gallery section styled close to the current site, now pulling from live listing photos where available."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {galleryListings.length
              ? galleryListings.map((listing) =>
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
                )
              : siteConfig.gallery.map((item, index) => (
                  <PlaceholderMedia
                    key={item}
                    label={item}
                    subtitle={index % 2 === 0 ? "Customer moments" : "Vehicle showcase"}
                  />
                ))}
          </div>
        </div>
      </section>

      <section id="socials" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Socials"
          title="Stay Connected"
          description="Instagram stays useful for promotion, but your website and admin system remain the source of truth for listings."
        />
        <div className="mt-8 flex flex-wrap gap-4">
          {siteConfig.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-[#2252e8] hover:text-[#2252e8]"
            >
              {social.label}
            </a>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="Why Choose Singh Car Bazar"
            description="The front-end stays close to the familiar site while the backend makes it operationally stronger."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {siteConfig.whyChooseUs.map((item) => (
              <article key={item.title} className="rounded-[28px] border border-slate-200 bg-[#f8fbff] p-7">
                <h3 className="font-display text-3xl uppercase tracking-[0.08em] text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Customer Feedback"
          description="Testimonials keep the current site’s trust-building tone but in a cleaner card layout."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {siteConfig.testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className={index === 1 ? "rounded-[28px] bg-[#2252e8] p-7 text-white" : "rounded-[28px] border border-slate-200 bg-white p-7"}
            >
              <p className={index === 1 ? "text-white/75" : "text-slate-500"}>
                {testimonial.role}
              </p>
              <h3 className={index === 1 ? "mt-3 font-display text-3xl uppercase tracking-[0.08em] text-white" : "mt-3 font-display text-3xl uppercase tracking-[0.08em] text-slate-900"}>
                {testimonial.name}
              </h3>
              <p className={index === 1 ? "mt-4 leading-7 text-white/88" : "mt-4 leading-7 text-slate-600"}>
                {testimonial.quote}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Start Your Inquiry"
              description="Website inquiries are stored in the database and can be linked to a specific car listing when submitted from an inventory page."
            />
            <div className="mt-8 grid gap-4 rounded-[28px] border border-slate-200 bg-[#f8fbff] p-6 text-slate-600">
              <p>Phone: {siteConfig.phone}</p>
              <p>Email: {siteConfig.email}</p>
              <p>Address: {siteConfig.address}</p>
              <p>Featured Cars: {formatNumber(featuredListings.length)}</p>
            </div>
          </div>
          <InquiryForm title="Contact / Inquiry" submitLabel="Request a Quote" />
        </div>
      </section>
    </>
  );
}
