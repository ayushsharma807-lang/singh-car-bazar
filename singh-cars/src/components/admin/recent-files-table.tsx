import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import type { AdminFileRecord } from "@/types";
import { StatusPill } from "@/components/admin/status-pill";

export function RecentFilesTable({ files }: { files: AdminFileRecord[] }) {
  return (
    <div className="grid gap-3">
      {files.map((file) => (
        <Link
          key={file.id}
          href={`/admin/files/${file.id}`}
          className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-gray-50"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{file.fileNumber}</p>
              <h3 className="mt-2 text-base font-semibold text-black">
                {file.carName} · {file.numberPlate}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Seller: {file.sellerName} · Buyer: {file.buyerName ?? "Not added yet"}
              </p>
              <p className="mt-1 text-xs text-gray-400">{formatDateTime(file.updatedAt)}</p>
            </div>
            <StatusPill status={file.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`rounded-xl border px-3 py-2 ${file.documentStatus.sellerReady ? "border-gray-200 bg-white text-black" : "border-gray-300 bg-gray-100 text-gray-800"}`}>
              Seller Docs {file.documentStatus.sellerReady ? "Ready" : "Missing"}
            </span>
            <span className={`rounded-xl border px-3 py-2 ${file.documentStatus.carReady ? "border-gray-200 bg-white text-black" : "border-gray-300 bg-gray-100 text-gray-800"}`}>
              Car Docs {file.documentStatus.carReady ? "Ready" : "Missing"}
            </span>
            <span className={`rounded-xl border px-3 py-2 ${file.documentStatus.buyerReady ? "border-gray-200 bg-white text-black" : "border-gray-300 bg-gray-100 text-gray-800"}`}>
              Buyer Docs {file.documentStatus.buyerReady ? "Ready" : "Missing"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
