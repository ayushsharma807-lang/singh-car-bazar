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
    missing: params.missing,
  });

  const title = getPageTitle(params);

  return (
    <AdminShell>
      <div className="grid gap-5">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Car Files
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-black">{title}</h1>
          <div className="mt-5">
            <FileFilters searchParams={params} />
          </div>
        </section>
        <FilesTable files={files} />
      </div>
    </AdminShell>
  );
}

function getPageTitle(searchParams: Record<string, string | undefined>) {
  if (searchParams.status === "available") {
    return "Cars in stock";
  }

  if (searchParams.status === "sold") {
    return "Sold cars";
  }

  if (searchParams.missing === "buyer") {
    return "Files missing buyer docs";
  }

  if (searchParams.missing === "seller") {
    return "Files missing seller docs";
  }

  return "Search by Number Plate, file number, seller, buyer, or phone";
}
