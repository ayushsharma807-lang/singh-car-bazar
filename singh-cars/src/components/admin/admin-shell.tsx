import Link from "next/link";
import type { ReactNode } from "react";
import { CarFront, FilePlus2, LogOut, Search } from "lucide-react";
import { adminSignOutAction } from "@/app/admin/actions";
import {
  DesktopAdminNav,
  MobileBottomNav,
} from "@/components/admin/admin-navigation";
import { getDashboardSummary } from "@/lib/data";
import type { DealerDashboardSummary } from "@/types";

export async function AdminShell({
  children,
  searchAction = "/admin/files",
  searchPlaceholder = "Search by Number Plate, file no., seller, buyer...",
}: {
  children: ReactNode;
  searchAction?: string;
  searchPlaceholder?: string;
}) {
  let summary: DealerDashboardSummary = {
    totalFiles: 0,
    carsInStock: 0,
    soldCars: 0,
    filesMissingBuyerDocuments: 0,
    filesMissingSellerDocuments: 0,
    completedFiles: 0,
    recentFiles: [],
  };
  let adminDataError: string | null = null;

  try {
    summary = await getDashboardSummary();
  } catch (error) {
    adminDataError = error instanceof Error ? error.message : "Admin data could not be loaded.";
  }
  const navItems = [
    { href: "/admin", label: "Home", icon: "home" as const },
    { href: "/admin/files", label: "Files", icon: "files" as const },
    { href: "/admin/files/new", label: "New", icon: "add" as const },
    {
      href: "/admin/completed-files",
      label: "Completed",
      icon: "completed" as const,
      count: summary.completedFiles,
    },
    { href: "/admin/help", label: "Help", icon: "help" as const },
  ];
  const mobileNavItems = navItems;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 px-3 py-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:px-4 lg:pb-4">
        <aside className="flex w-[220px] shrink-0 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm max-lg:hidden">
          <div className="grid gap-5">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-black">
                <CarFront className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Singh Car Bazar
                </p>
                <p className="mt-1 text-sm font-semibold text-black">Dealer file system</p>
              </div>
            </div>

            <DesktopAdminNav items={navItems} />
          </div>

          <form action={adminSignOutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">
                  Singh Car Bazar
                </p>
                <h1 className="mt-1 text-base font-semibold text-black sm:text-xl">
                  Easy car files for seller, car, and buyer
                </h1>
                <p className="mt-2 text-sm text-gray-600 max-sm:hidden">
                  Add a file fast, search by number plate, and keep papers in one place.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <form action={searchAction} className="relative w-full md:w-[360px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    name="query"
                    placeholder={searchPlaceholder}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-10 text-sm text-black shadow-sm outline-none placeholder:text-gray-400"
                  />
                </form>
                <Link
                  href="/admin/files/new"
                  className="admin-btn max-lg:hidden"
                >
                  <FilePlus2 className="h-4 w-4" />
                  New File
                </Link>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
          {adminDataError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {adminDataError}
            </div>
          ) : null}
        </div>
      </div>
      <MobileBottomNav items={mobileNavItems} />
    </div>
  );
}
