import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminFiles, getAdminSetupErrorMessage } from "@/lib/data";
import { StatusPill } from "@/components/admin/status-pill";

type CompletedFilesPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

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
      <AdminShell>
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
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
      searchPlaceholder="Search completed files by number plate, file no., seller, buyer..."
    >
      <div className="grid gap-5">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Completed Files
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-black">Finished sold deals</h1>
          <p className="mt-2 text-sm text-gray-600">
            These files are sold and fully finished with seller, car, buyer, and documents.
          </p>
        </section>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white text-gray-500">
                <tr>
                  {["File Number", "Car", "Seller", "Buyer", "Sold Status", "Completed", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-t border-gray-200 text-gray-700">
                    <td className="px-4 py-3 font-semibold text-black">{file.fileNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{file.carName}</p>
                      <p className="text-xs text-gray-500">{file.numberPlate}</p>
                    </td>
                    <td className="px-4 py-3">{file.sellerName}</td>
                    <td className="px-4 py-3">{file.buyerName ?? "Buyer added"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={file.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-xl border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link href={`/admin/files/${file.id}`} className="text-sky-700 hover:underline">
                          Open File
                        </Link>
                        <Link href={`/admin/files/${file.id}`} className="text-black hover:underline">
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {!files.length ? (
                  <tr className="border-t border-gray-200">
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                      No completed files found yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
