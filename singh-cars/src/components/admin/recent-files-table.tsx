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
          className="block rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/30"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8a2e]">{file.fileNumber}</p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                {file.carName} · {file.numberPlate}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Seller: {file.sellerName} · Buyer: {file.buyerName ?? "Not added yet"}
              </p>
              <p className="mt-1 text-xs text-slate-400">{formatDateTime(file.updatedAt)}</p>
            </div>
            <StatusPill status={file.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`rounded-full px-3 py-2 ${file.documentStatus.sellerReady ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              Seller Docs {file.documentStatus.sellerReady ? "Ready" : "Missing"}
            </span>
            <span className={`rounded-full px-3 py-2 ${file.documentStatus.carReady ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              Car Docs {file.documentStatus.carReady ? "Ready" : "Missing"}
            </span>
            <span className={`rounded-full px-3 py-2 ${file.documentStatus.buyerReady ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              Buyer Docs {file.documentStatus.buyerReady ? "Ready" : "Missing"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
