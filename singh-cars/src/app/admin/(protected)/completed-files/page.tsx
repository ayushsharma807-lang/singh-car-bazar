import Link from "next/link";
import { MessageCircleMore, Pencil, Search, SquareArrowOutUpRight } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { buildAdminCarName, getAdminFiles, getAdminSetupErrorMessage } from "@/lib/data";

type CompletedFilesPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function buildWhatsappShareLink(file: Awaited<ReturnType<typeof getAdminFiles>>[number]) {
  const summary = [
    "Singh Car Bazar File",
    `File No: ${file.fileNumber}`,
    `Car: ${buildAdminCarName(file.listing)}`,
    file.numberPlate ? `Number Plate: ${file.numberPlate}` : "",
    file.sellerName ? `Seller: ${file.sellerName}` : "",
    file.buyerName ? `Buyer: ${file.buyerName}` : "",
    `Status: ${file.status === "sold" ? "Sold" : "Ready"}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/?text=${encodeURIComponent(summary)}`;
}

export default async function CompletedFilesPage({
  searchParams,
}: CompletedFilesPageProps) {
  const params = await searchParams;
  let files = null;
  let adminDataError: string | null = null;

  try {
    files = await getAdminFiles({
      query: params.query,
      completed: "only",
    });
  } catch (error) {
    adminDataError = getAdminSetupErrorMessage(error);
  }

  if (!files) {
    return (
      <AdminShell
        searchAction="/admin/completed-files"
        searchPlaceholder="Search completed files..."
      >
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]">Admin Setup Needed</p>
          <h1 className="mt-2 text-2xl font-semibold">Completed files could not load</h1>
          <p className="mt-3 text-sm">{adminDataError}</p>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      searchAction="/admin/completed-files"
      searchPlaceholder="Search by file no. or number plate..."
    >
      <div className="grid gap-4">
        {params.completed === "1" ? (
          <section className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 shadow-sm">
            File moved to Completed.
          </section>
        ) : null}

        <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
            Completed
          </p>
          <h1 className="mt-1 text-xl font-semibold text-black sm:text-2xl">
            Finished deals
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View sold files, edit if needed, or share on WhatsApp.
          </p>
        </section>

        {files.length ? (
          <div className="grid gap-3">
            {files.map((file) => (
              <article
                key={file.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                      {file.fileNumber}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-black">
                      {file.carName}
                    </h2>
                    {file.numberPlate ? (
                      <p className="mt-1 text-sm text-gray-600">{file.numberPlate}</p>
                    ) : null}
                  </div>
                  <div className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Completed
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                      Seller
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black">{file.sellerName}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                      Buyer
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black">
                      {file.buyerName || "Buyer added"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Link
                    href={`/admin/files/${file.id}`}
                    className="admin-btn h-11 justify-center text-sm"
                  >
                    <SquareArrowOutUpRight className="h-4 w-4" />
                    View
                  </Link>
                  <Link
                    href={`/admin/files/${file.id}`}
                    className="admin-btn h-11 justify-center text-sm"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    href={buildWhatsappShareLink(file)}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn h-11 justify-center text-sm"
                  >
                    <MessageCircleMore className="h-4 w-4" />
                    Share on WhatsApp
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-black">No completed files yet</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sold files with all papers will show here automatically.
            </p>
          </section>
        )}
      </div>
    </AdminShell>
  );
}
