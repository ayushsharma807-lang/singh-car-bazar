import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardSummary } from "@/lib/data";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <AdminShell title="Dashboard Summary">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Cars", String(summary.totalCars)],
          ["Available Cars", String(summary.availableCars)],
          ["Sold Cars", String(summary.soldCars)],
          ["Recent Inquiries", String(summary.recentInquiries.length)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className="mt-3 font-display text-5xl uppercase tracking-[0.08em] text-white">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-3xl uppercase tracking-[0.08em] text-white">
              Recent Inquiries
            </p>
            <Link href="/admin/inquiries" className="text-sm uppercase tracking-[0.2em] text-[#ff8a2e]">
              View All
            </Link>
          </div>
          <div className="mt-5 grid gap-4">
            {summary.recentInquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-[20px] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">{inquiry.name}</p>
                <p className="mt-1">{inquiry.phone}</p>
                <p className="mt-1">
                  {inquiry.listingId ? `Listing ${inquiry.listingId}` : "General inquiry"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="font-display text-3xl uppercase tracking-[0.08em] text-white">
            Quick Actions
          </p>
          <div className="mt-5 grid gap-3">
            <Link href="/admin/listings/new" className="rounded-[18px] bg-[#2252e8] px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Add Car
            </Link>
            <Link href="/admin/listings" className="rounded-[18px] bg-white/10 px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Manage Listings
            </Link>
            <Link href="/admin/inquiries" className="rounded-[18px] bg-white/10 px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">
              View Inquiries
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
