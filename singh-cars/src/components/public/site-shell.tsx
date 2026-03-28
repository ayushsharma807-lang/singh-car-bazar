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
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <div className="bg-[#ff8a2e] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{siteConfig.address}</p>
          <div className="flex flex-wrap gap-4">
            <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="font-display text-4xl uppercase tracking-[0.12em] text-[#2252e8]">
            Singh Car Bazar
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
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition",
                    isActive
                      ? "bg-[#2252e8] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-[#ff8a2e] hover:text-white",
                  )}
                >
                  {item.label}
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
              <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
            <div>
              <p className="font-display text-4xl uppercase tracking-[0.1em] text-[#2252e8]">
                {siteConfig.businessName}
              </p>
              <p className="mt-4 max-w-md text-base leading-8 text-slate-600">
                Used car buying, selling, finance support, insurance help, and live listings managed from one system.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff8a2e]">
                Contact
              </p>
              <div className="mt-4 grid gap-3 text-slate-600">
                <p>{siteConfig.address}</p>
                <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff8a2e]">
                Socials
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {siteConfig.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-[#2252e8] hover:text-white"
                  >
                    {social.label}
                  </a>
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
        className="fixed bottom-5 right-5 z-50 inline-flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#25D366] text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_18px_40px_rgba(37,211,102,0.32)]"
      >
        WA
      </a>
    </div>
  );
}
