import Link from "next/link";
import type { ReactNode } from "react";
import { adminSignOutAction } from "@/app/admin/actions";

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="border-b border-white/10 bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-display text-3xl uppercase tracking-[0.1em] text-white">
              Singh Car Bazar Admin
            </p>
            <p className="mt-1 text-sm text-slate-400">Dealer management dashboard</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {[
              ["Dashboard", "/admin"],
              ["Listings", "/admin/listings"],
              ["Inquiries", "/admin/inquiries"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10"
              >
                {label}
              </Link>
            ))}
            <form action={adminSignOutAction}>
              <button className="rounded-full bg-[#ff8a2e] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </aside>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-5xl uppercase tracking-[0.08em] text-white">
            {title}
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
}
