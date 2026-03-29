import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  children: ReactNode;
  currentPath?: string;
  compactFooter?: boolean;
};

export function SiteShell({
  children,
  currentPath = "/",
  compactFooter = false,
}: SiteShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{siteConfig.address}</p>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-slate-950" href={siteConfig.phoneHref}>
              {siteConfig.phone}
            </a>
            <a className="transition hover:text-slate-950" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="font-display text-4xl uppercase tracking-[0.12em] text-slate-950">
            Singh Car <span className="text-slate-500">Bazar</span>
          </Link>
          <nav className="scrollbar-hide flex gap-2 overflow-x-auto">
            {siteConfig.navigation.map((item) => {
              const isActive =
                item.href === currentPath ||
                (item.href !== "/" && currentPath.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/15",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm hover:bg-slate-900 hover:text-white focus-visible:text-white visited:text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 visited:text-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "block",
                      isActive ? "text-white" : "text-slate-700 group-hover:text-slate-950",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
      {compactFooter ? (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p className="font-semibold text-slate-900">{siteConfig.businessName}</p>
            <div className="flex flex-wrap gap-4">
              <a className="transition hover:text-slate-950" href={siteConfig.phoneHref}>
                {siteConfig.phone}
              </a>
              <a className="transition hover:text-slate-950" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
            <div>
              <p className="font-display text-4xl uppercase tracking-[0.1em] text-slate-950">
                Singh Car <span className="text-slate-500">Bazar</span>
              </p>
              <p className="mt-4 max-w-md text-base leading-8 text-slate-600">
                Used car buying, selling, finance support, insurance help, and live listings managed from one system.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Contact
              </p>
              <div className="mt-4 grid gap-3 text-slate-600">
                <p>{siteConfig.address}</p>
                <a className="transition hover:text-slate-950" href={siteConfig.phoneHref}>
                  {siteConfig.phone}
                </a>
                <a className="transition hover:text-slate-950" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Socials
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {siteConfig.socials.map((social) => (
                  social.href ? (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                    >
                      {social.label}
                    </a>
                  ) : (
                    <span
                      key={social.label}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400"
                    >
                      {social.label}
                    </span>
                  )
                ))}
              </div>
            </div>
          </div>
        </footer>
      )}
      <a
        href={`https://wa.me/${siteConfig.whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 inline-flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#1fa855] bg-[#25D366] text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition hover:scale-[1.02]"
      >
        WA
      </a>
    </div>
  );
}
