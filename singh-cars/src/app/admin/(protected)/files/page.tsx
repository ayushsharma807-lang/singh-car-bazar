import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { FileFilters } from "@/components/admin/file-filters";
import { FilesTable } from "@/components/admin/files-table";
import type { AdminFileRecord } from "@/types";
import { getAdminFiles, getAdminSetupErrorMessage } from "@/lib/data";

type AdminFilesPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminFilesPage({
  searchParams,
}: AdminFilesPageProps) {
  const params = await searchParams;
  const title = getPageTitle(params);
  let files = null;
  let adminDataError: string | null = null;

  try {
    files = await getAdminFiles({
      query: params.query,
      status: params.status,
      sellerType: params.sellerType,
      missing: params.missing,
      completed: "exclude",
    });
  } catch (error) {
    adminDataError = getAdminSetupErrorMessage(error);
  }

  if (!files) {
    return (
      <AdminShell>
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]">Admin Setup Needed</p>
          <h1 className="mt-2 text-2xl font-semibold">Car files could not load</h1>
          <p className="mt-3 text-sm">{adminDataError}</p>
        </section>
      </AdminShell>
    );
  }

  const exactMatch = findExactFileMatch(files, params.query);
  if (exactMatch) {
    redirect(`/admin/files/${exactMatch.id}`);
  }

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

function normalizeQuery(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findExactFileMatch(files: AdminFileRecord[], query?: string) {
  if (!query?.trim()) {
    return null;
  }

  const normalizedQuery = normalizeQuery(query);

  return (
    files.find((file) => {
      const fileNumber = normalizeQuery(file.fileNumber);
      const numberPlate = normalizeQuery(file.numberPlate);

      return normalizedQuery === fileNumber || normalizedQuery === numberPlate;
    }) ?? null
  );
}

function getPageTitle(searchParams: Record<string, string | undefined>) {
  if (searchParams.status === "available") {
    return "Cars in stock";
  }

  if (searchParams.status === "sold") {
    return "Sold cars still being finished";
  }

  if (searchParams.missing === "buyer") {
    return "Files missing buyer docs";
  }

  if (searchParams.missing === "seller") {
    return "Files missing seller docs";
  }

  return "Active files by Number Plate, file number, seller, buyer, or phone";
}
