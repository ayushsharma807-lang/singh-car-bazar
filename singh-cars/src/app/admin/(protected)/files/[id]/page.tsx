import { notFound } from "next/navigation";
import { markListingSoldAction } from "@/app/admin/actions";
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                File {file.fileNumber}
              </p>
              <div className="mt-3">
                <StatusPill status={file.status} />
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
