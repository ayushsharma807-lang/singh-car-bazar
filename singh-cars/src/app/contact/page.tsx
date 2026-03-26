import { InquiryForm } from "@/components/public/inquiry-form";
import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";

export default function ContactPage() {
  return (
    <SiteShell currentPath="/contact">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
            Contact
          </p>
          <h1 className="mt-3 font-display text-6xl uppercase tracking-[0.08em] text-slate-900">
            Contact Us
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Reach out for buying, selling, finance, insurance, or any listing-related inquiry.
          </p>
          <div className="mt-8 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            <p>Phone: {siteConfig.phone}</p>
            <p>Email: {siteConfig.email}</p>
            <p>Address: {siteConfig.address}</p>
          </div>
        </div>
        <InquiryForm />
      </section>
    </SiteShell>
  );
}
