import { SiteShell } from "@/components/public/site-shell";
import { siteConfig } from "@/config/site";

export default function SocialsPage() {
  return (
    <SiteShell currentPath="/socials">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
          Socials
        </p>
        <h1 className="mt-3 font-display text-6xl uppercase tracking-[0.08em] text-slate-900">
          Follow Singh Car Bazar
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Stay updated with new arrivals, customer deliveries, and showroom highlights across our active social channels.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {siteConfig.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2252e8]">
                Social Channel
              </p>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-slate-900">
                {social.label}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Open our {social.label} page in a new tab.
              </p>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
