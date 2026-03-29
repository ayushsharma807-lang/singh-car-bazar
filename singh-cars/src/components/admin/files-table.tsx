import Link from "next/link";
import type { AdminFileRecord } from "@/types";
import { StatusPill } from "@/components/admin/status-pill";

export function FilesTable({ files }: { files: AdminFileRecord[] }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:hidden">
        {files.map((file) => (
          <article key={file.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{file.fileNumber}</p>
                <h2 className="mt-2 text-lg font-semibold text-black">{file.carName}</h2>
                <p className="mt-1 text-sm text-gray-500">{file.numberPlate}</p>
              </div>
              <StatusPill status={file.status} />
            </div>

            <div className="mt-4 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <p><span className="font-semibold text-black">Seller:</span> {file.sellerName}</p>
              <p><span className="font-semibold text-black">Buyer:</span> {file.buyerName ?? "Not added yet"}</p>
              <p><span className="font-semibold text-black">Stage:</span> {file.stage}</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <DocBadge label="Seller Docs" ready={file.documentStatus.sellerReady} />
              <DocBadge label="Car Docs" ready={file.documentStatus.carReady} />
              <DocBadge label="Buyer Docs" ready={file.documentStatus.buyerReady} />
            </div>

            <div className="mt-3">
              <PublicBadge ready={file.publicListingStatus.ready} />
            </div>

            <div className="mt-4 flex gap-3">
              <Link href={`/admin/files/${file.id}`} className="admin-btn flex-1 text-center">
                Open File
              </Link>
              {file.publicListingStatus.ready ? (
                <Link href={`/inventory/${file.id}`} className="admin-btn flex-1 text-center">
                  View Public Listing
                </Link>
              ) : null}
              <Link href={`/admin/files/${file.id}/edit`} className="admin-btn flex-1 text-center">
                Edit Car
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white text-gray-500">
            <tr>
              {["File", "Car", "Seller", "Buyer", "Status", "Seller Docs", "Car Docs", "Buyer Docs", "Public", "Actions"].map((heading) => (
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
                <td className="px-4 py-3">{file.buyerName ?? "Not added yet"}</td>
                <td className="px-4 py-3">
                  <StatusPill status={file.status} />
                </td>
                <td className="px-4 py-3"><DocBadge label="Seller" ready={file.documentStatus.sellerReady} compact /></td>
                <td className="px-4 py-3"><DocBadge label="Car" ready={file.documentStatus.carReady} compact /></td>
                <td className="px-4 py-3"><DocBadge label="Buyer" ready={file.documentStatus.buyerReady} compact /></td>
                <td className="px-4 py-3"><PublicBadge ready={file.publicListingStatus.ready} compact /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/files/${file.id}`} className="text-sky-700 hover:underline">
                      Open File
                    </Link>
                    {file.publicListingStatus.ready ? (
                      <Link href={`/inventory/${file.id}`} className="text-gray-700 hover:underline">
                        View Public
                      </Link>
                    ) : null}
                    <Link href={`/admin/files/${file.id}/edit`} className="text-black hover:underline">
                      Edit Car
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PublicBadge({
  ready,
  compact = false,
}: {
  ready: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold ${
        ready ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"
      } ${compact ? "" : "w-full"}`}
    >
      {compact ? (ready ? "Ready" : "Incomplete") : `Public: ${ready ? "Ready" : "Incomplete"}`}
    </span>
  );
}

function DocBadge({
  label,
  ready,
  compact = false,
}: {
  label: string;
  ready: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold ${
        ready ? "border-gray-200 bg-white text-black" : "border-gray-300 bg-gray-100 text-gray-800"
      } ${compact ? "" : "w-full"}`}
    >
      {compact ? (ready ? "Ready" : "Missing") : `${label}: ${ready ? "Ready" : "Missing"}`}
    </span>
  );
}
