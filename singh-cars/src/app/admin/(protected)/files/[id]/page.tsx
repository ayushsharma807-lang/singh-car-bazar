import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { FileWorkspace } from "@/components/admin/file-workspace";
import { StatusPill } from "@/components/admin/status-pill";
import { getAdminFileById } from "@/lib/data";

type AdminFileDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminFileDetailPage({
  params,
}: AdminFileDetailPageProps) {
  const { id } = await params;
  const file = await getAdminFileById(id);

  if (!file) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="grid gap-5">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                File {file.fileNumber}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-black">
                {file.carName}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {file.numberPlate} · Seller: {file.sellerName} · Buyer: {file.buyerName ?? "Pending"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={file.status} />
              <Link
                href={`/admin/files/${file.id}/edit`}
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Edit File
              </Link>
            </div>
          </div>
        </section>

        <FileWorkspace file={file} />
      </div>
    </AdminShell>
  );
}
