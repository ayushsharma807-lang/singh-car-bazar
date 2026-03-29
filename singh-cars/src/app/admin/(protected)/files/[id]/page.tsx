import { notFound } from "next/navigation";
import { markListingSoldAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { FileWorkspace } from "@/components/admin/file-workspace";
import { StatusPill } from "@/components/admin/status-pill";
import { getAdminFileById, getPublicListingChecklist } from "@/lib/data";

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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                File {file.fileNumber}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusPill status={file.status} />
                <span
                  className={`inline-flex rounded-xl border px-3 py-1 text-xs font-semibold ${
                    file.publicListingStatus.ready
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  Public {file.publicListingStatus.ready ? "Ready" : "Incomplete"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {file.publicListingStatus.ready ? (
                  <span className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
                    Ready for public listing
                  </span>
                ) : (
                  getPublicListingChecklist(file.publicListingStatus.missing).map((item) => (
                    <span
                      key={item}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
                    >
                      {item}
                    </span>
                  ))
                )}
              </div>
            </div>
            <form action={markListingSoldAction}>
              <input type="hidden" name="listingId" value={file.id} />
              <button
                type="submit"
                className="admin-btn h-12 px-5 text-base"
                disabled={file.status === "sold"}
              >
                {file.status === "sold" ? "Already Sold" : "Mark as Sold"}
              </button>
            </form>
          </div>
        </section>

        <FileWorkspace file={file} />
      </div>
    </AdminShell>
  );
}
