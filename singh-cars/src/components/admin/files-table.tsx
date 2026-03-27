import Link from "next/link";
import type { AdminFileRecord } from "@/types";
import { StatusPill } from "@/components/admin/status-pill";

export function FilesTable({ files }: { files: AdminFileRecord[] }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:hidden">
        {files.map((file) => (
          <article key={file.id} className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8a2e]">{file.fileNumber}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{file.carName}</h2>
                <p className="mt-1 text-sm text-slate-500">{file.numberPlate}</p>
              </div>
              <StatusPill status={file.status} />
            </div>

            <div className="mt-4 grid gap-3 rounded-[22px] bg-sky-50/50 p-4 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Seller:</span> {file.sellerName}</p>
              <p><span className="font-semibold text-slate-900">Buyer:</span> {file.buyerName ?? "Not added yet"}</p>
              <p><span className="font-semibold text-slate-900">Stage:</span> {file.stage}</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <DocBadge label="Seller Docs" ready={file.documentStatus.sellerReady} />
              <DocBadge label="Car Docs" ready={file.documentStatus.carReady} />
              <DocBadge label="Buyer Docs" ready={file.documentStatus.buyerReady} />
            </div>

            <div className="mt-4 flex gap-3">
              <Link href={`/admin/files/${file.id}`} className="flex-1 rounded-full bg-[#2252e8] px-5 py-3 text-center text-sm font-semibold text-white">
                Open File
              </Link>
              <Link href={`/admin/files/${file.id}/edit`} className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700">
                Edit Car
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-sm lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sky-50/70 text-slate-500">
            <tr>
              {["File", "Car", "Seller", "Buyer", "Status", "Seller Docs", "Car Docs", "Buyer Docs", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-t border-slate-100 text-slate-700">
                <td className="px-4 py-3 font-semibold text-slate-900">{file.fileNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{file.carName}</p>
                  <p className="text-xs text-slate-500">{file.numberPlate}</p>
                </td>
                <td className="px-4 py-3">{file.sellerName}</td>
                <td className="px-4 py-3">{file.buyerName ?? "Not added yet"}</td>
                <td className="px-4 py-3">
                  <StatusPill status={file.status} />
                </td>
                <td className="px-4 py-3"><DocBadge label="Seller" ready={file.documentStatus.sellerReady} compact /></td>
                <td className="px-4 py-3"><DocBadge label="Car" ready={file.documentStatus.carReady} compact /></td>
                <td className="px-4 py-3"><DocBadge label="Buyer" ready={file.documentStatus.buyerReady} compact /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/files/${file.id}`} className="text-sky-700 hover:underline">
                      Open File
                    </Link>
                    <Link href={`/admin/files/${file.id}/edit`} className="text-[#ff8a2e] hover:underline">
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
      className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold ${
        ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      } ${compact ? "" : "w-full"}`}
    >
      {compact ? (ready ? "Ready" : "Missing") : `${label}: ${ready ? "Ready" : "Missing"}`}
    </span>
  );
}
