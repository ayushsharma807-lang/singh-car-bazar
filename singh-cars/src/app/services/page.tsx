import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";

export default function ServicesPage() {
  return (
    <SiteShell currentPath="/services">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
          Services
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-slate-900 sm:text-6xl">
          Services
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          The same core showroom services from the current site, now backed by live inventory and admin workflows.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {siteConfig.services.map((service) => (
            <article key={service.title} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-slate-900">
                {service.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
