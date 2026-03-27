import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types";

export function StatusPill({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        status === "available" && "bg-emerald-100 text-emerald-700",
        status === "booked" && "bg-amber-100 text-amber-700",
        status === "sold" && "bg-slate-200 text-slate-700",
      )}
    >
      {status}
    </span>
  );
}
