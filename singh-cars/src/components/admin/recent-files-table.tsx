import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import type { AdminFileRecord } from "@/types";
import { StatusPill } from "@/components/admin/status-pill";

export function RecentFilesTable({ files }: { files: AdminFileRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sky-50/70 text-slate-500">
          <tr>
            {[
              "File",
              "Vehicle",
              "Seller",
              "Buyer",
              "Status",
              "Seller Docs",
              "Car Docs",
              "Buyer Docs",
            ].map((heading) => (
              <th key={heading} className="px-4 py-3 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-t border-slate-100 text-slate-700">
              <td className="px-4 py-3">
                <Link href={`/admin/files/${file.id}`} className="font-semibold text-slate-900 hover:underline">
                  {file.fileNumber}
                </Link>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(file.updatedAt)}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{file.carName}</p>
                <p className="text-xs text-slate-500">{file.numberPlate}</p>
              </td>
              <td className="px-4 py-3">{file.sellerName}</td>
              <td className="px-4 py-3">{file.buyerName ?? "Pending"}</td>
              <td className="px-4 py-3">
                <StatusPill status={file.status} />
              </td>
              <td className="px-4 py-3">{file.documentStatus.sellerReady ? "Ready" : "Missing"}</td>
              <td className="px-4 py-3">{file.documentStatus.carReady ? "Ready" : "Missing"}</td>
              <td className="px-4 py-3">{file.documentStatus.buyerReady ? "Ready" : "Missing"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
