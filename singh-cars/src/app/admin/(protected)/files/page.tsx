import { AdminShell } from "@/components/admin/admin-shell";
import { FileFilters } from "@/components/admin/file-filters";
import { FilesTable } from "@/components/admin/files-table";
import { getAdminFiles } from "@/lib/data";

type AdminFilesPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminFilesPage({
  searchParams,
}: AdminFilesPageProps) {
  const params = await searchParams;
  const files = await getAdminFiles({
    query: params.query,
    status: params.status,
    sellerType: params.sellerType,
  });

  return (
    <AdminShell>
      <div className="grid gap-5">
        <section className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
            All Deal Files
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Search by file number, number plate, seller, buyer, or phone
          </h1>
          <div className="mt-5">
            <FileFilters searchParams={params} />
          </div>
        </section>
        <FilesTable files={files} />
      </div>
    </AdminShell>
  );
}
