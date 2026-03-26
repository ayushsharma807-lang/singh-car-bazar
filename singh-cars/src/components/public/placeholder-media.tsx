import { cn } from "@/lib/utils";

type PlaceholderMediaProps = {
  label: string;
  subtitle?: string;
  className?: string;
};

export function PlaceholderMedia({
  label,
  subtitle,
  className,
}: PlaceholderMediaProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(140deg,#dbe7ff,#ffffff_38%,#ffe4cc)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(43,92,255,0.2),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,136,46,0.2),transparent_28%)]" />
      <div className="absolute left-5 top-5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm">
        Placeholder
      </div>
      <div className="relative flex h-full min-h-[220px] flex-col justify-end p-6">
        <p className="font-display text-3xl uppercase tracking-[0.08em] text-slate-900">
          {label}
        </p>
        {subtitle ? (
          <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-600">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
