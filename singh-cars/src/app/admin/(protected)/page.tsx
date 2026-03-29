import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { RecentFilesTable } from "@/components/admin/recent-files-table";
import { getAdminSetupErrorMessage, getDashboardSummary } from "@/lib/data";

type AdminDashboardPageProps = {
  searchParams: Promise<{
    saved?: string;
    file?: string;
  }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const { saved, file: fileId } = await searchParams;
  let summary = null;
  let adminDataError: string | null = null;

  try {
    summary = await getDashboardSummary();
  } catch (error) {
    adminDataError = getAdminSetupErrorMessage(error);
  }

  if (!summary) {
    return (
      <AdminShell>
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]">Admin Setup Needed</p>
          <h1 className="mt-2 text-2xl font-semibold">Dashboard could not load</h1>
          <p className="mt-3 text-sm">{adminDataError}</p>
        </section>
      </AdminShell>
    );
  }

  const recentFiles = fileId
    ? [...summary.recentFiles].sort((left, right) => {
        if (left.id === fileId) {
          return -1;
        }

        if (right.id === fileId) {
          return 1;
        }

        return 0;
      })
    : summary.recentFiles;

  return (
    <AdminShell>
      {saved === "car" ? (
        <section className="mb-5 rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-sm font-semibold text-green-800 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Car saved successfully.</span>
            {fileId ? (
              <Link href={`/admin/files/${fileId}`} className="text-sm font-semibold text-green-900 underline underline-offset-4">
                Open file
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

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
          <RecentFilesTable files={recentFiles} highlightedFileId={fileId ?? null} />
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
