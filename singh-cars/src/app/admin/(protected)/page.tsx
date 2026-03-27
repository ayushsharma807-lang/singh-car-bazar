import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { RecentFilesTable } from "@/components/admin/recent-files-table";
import { getDashboardSummary } from "@/lib/data";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <AdminShell>
      <div className="grid gap-4 xl:grid-cols-5">
        <DashboardCard href="/admin/files" label="Total Files" value={summary.totalFiles} hint="All car files" />
        <DashboardCard href="/admin/files?status=available" label="Cars In Stock" value={summary.carsInStock} hint="Cars ready for sale" />
        <DashboardCard href="/admin/files?status=sold" label="Sold Cars" value={summary.soldCars} hint="Cars already sold" />
        <DashboardCard href="/admin/files?missing=buyer" label="Missing Buyer Docs" value={summary.filesMissingBuyerDocuments} hint="Files waiting for buyer papers" />
        <DashboardCard href="/admin/files?missing=seller" label="Missing Seller Docs" value={summary.filesMissingSellerDocuments} hint="Files waiting for seller papers" />
      </div>

      <div className="mt-5">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                Recently Updated Files
              </p>
              <h2 className="mt-2 text-xl font-semibold text-black">
                Open the car files you changed last
              </h2>
            </div>
            <Link href="/admin/files" className="inline-flex items-center gap-2 text-sm font-semibold text-black">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <RecentFilesTable files={summary.recentFiles} />
        </section>
      </div>
    </AdminShell>
  );
}

function DashboardCard({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="block cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
    >
      <span className="inline-flex rounded-xl border border-gray-200 px-3 py-1 text-xs font-semibold text-black">
        {label}
      </span>
      <p className="mt-4 text-4xl font-semibold text-black">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{hint}</p>
    </Link>
  );
}
