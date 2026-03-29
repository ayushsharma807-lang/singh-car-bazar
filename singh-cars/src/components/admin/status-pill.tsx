import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types";

export function StatusPill({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-xl border px-3 py-1 text-xs font-semibold",
        status === "available" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "booked" && "border-gray-200 bg-gray-50 text-gray-800",
        status === "sold" && "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {status}
    </span>
  );
}
