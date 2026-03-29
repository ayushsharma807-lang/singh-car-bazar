"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCheck,
  CircleHelp,
  FilePlus2,
  Files,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: "home" | "files" | "add" | "completed" | "help";
  count?: number;
};

const iconMap = {
  home: LayoutGrid,
  files: Files,
  add: FilePlus2,
  completed: CheckCheck,
  help: CircleHelp,
} as const;

function isActivePath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopAdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition",
              isActive
                ? "border-gray-200 bg-gray-50 text-black"
                : "border-transparent text-gray-800 hover:border-gray-200 hover:bg-gray-50",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border text-black",
                isActive ? "border-gray-300 bg-white" : "border-gray-200 bg-white",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span>{item.label}</span>
              {typeof item.count === "number" ? (
                <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {item.count}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition",
                isActive ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black",
              )}
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
                {typeof item.count === "number" && item.count > 0 ? (
                  <span
                    className={cn(
                      "absolute -right-3 -top-2 rounded-full border px-1.5 py-0.5 text-[10px] leading-none",
                      isActive
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-gray-200 bg-white text-gray-700",
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </div>
              <span className="text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
