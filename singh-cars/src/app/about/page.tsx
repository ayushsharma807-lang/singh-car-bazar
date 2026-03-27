import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <SiteShell currentPath="/about">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(145deg,#eef4ff,#ffffff_42%,#fff3e8)] p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
              About
            </p>
            <h1 className="mt-4 font-display text-5xl uppercase tracking-[0.08em] text-slate-900">
              Serving Buyers And Sellers Since 1993
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Singh Car Bazar is known in Jalandhar for practical used-car deals, responsive support, and smoother paperwork. The website now keeps inventory at the center while preserving the familiar business feel.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="grid gap-4">
              {[
                "Live stock management for available, booked, and sold cars",
                "Seller, buyer, inquiry, and document details managed in one place",
                "Public inventory pages connected directly to your own database",
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
            Why Choose Us
          </p>
          <h2 className="mt-3 font-display text-5xl uppercase tracking-[0.08em] text-slate-900">
            Why Choose Singh Car Bazar
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            The public website is now cleaner and multi-page, while the backend makes the business operationally stronger.
          </p>
        </div>
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
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
              Testimonials
            </p>
            <h2 className="mt-3 font-display text-5xl uppercase tracking-[0.08em] text-slate-900">
              Customer Feedback
            </h2>
          </div>
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
        </div>
      </section>
    </SiteShell>
  );
}
