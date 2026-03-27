import Link from "next/link";
import type { AdminFileRecord } from "@/types";
import { StatusPill } from "@/components/admin/status-pill";

export function FilesTable({ files }: { files: AdminFileRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sky-50/70 text-slate-500">
          <tr>
            {["File", "Vehicle", "Seller", "Buyer", "Stage", "Status", "Docs", "Actions"].map((heading) => (
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
              <td className="px-4 py-3">{file.buyerName ?? "Pending"}</td>
              <td className="px-4 py-3 uppercase">{file.stage}</td>
              <td className="px-4 py-3">
                <StatusPill status={file.status} />
              </td>
              <td className="px-4 py-3 text-xs">
                S:{file.documentStatus.sellerReady ? "Y" : "N"} C:{file.documentStatus.carReady ? "Y" : "N"} B:{file.documentStatus.buyerReady ? "Y" : "N"}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <Link href={`/admin/files/${file.id}`} className="text-sky-700 hover:underline">
                    Open
                  </Link>
                  <Link href={`/admin/files/${file.id}/edit`} className="text-[#ff8a2e] hover:underline">
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
