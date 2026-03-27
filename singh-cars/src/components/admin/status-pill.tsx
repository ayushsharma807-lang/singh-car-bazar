import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types";

export function StatusPill({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-xl border px-3 py-1 text-xs font-semibold",
        status === "available" && "border-gray-200 bg-white text-black",
        status === "booked" && "border-gray-200 bg-gray-50 text-gray-800",
        status === "sold" && "border-gray-300 bg-gray-100 text-black",
      )}
    >
      {status}
    </span>
  );
}
