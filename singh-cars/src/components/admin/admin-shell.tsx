import Link from "next/link";
import type { ReactNode } from "react";
import {
  CarFront,
  FilePlus2,
  Files,
  LayoutGrid,
  LogOut,
  Search,
} from "lucide-react";
import { adminSignOutAction } from "@/app/admin/actions";

const navItems = [
  { href: "/admin", label: "Home", icon: LayoutGrid },
  { href: "/admin/files", label: "Car Files", icon: Files },
  { href: "/admin/files/new", label: "Add Car", icon: FilePlus2 },
];

export function AdminShell({
  children,
  searchAction = "/admin/files",
  searchPlaceholder = "Search by Number Plate, file no., seller, buyer...",
}: {
  children: ReactNode;
  searchAction?: string;
  searchPlaceholder?: string;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 px-3 py-3 lg:px-4">
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

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-gray-800 transition hover:border-gray-200 hover:bg-gray-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-black">
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
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
          <header className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">
                  Singh Car Bazar
                </p>
                <h1 className="mt-1 text-xl font-semibold text-black">
                  Easy car files for seller, car, buyer, and documents
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Add a car fast, search by number plate, and keep every paper in one place.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <form action={searchAction} className="relative w-full md:w-[390px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    name="query"
                    placeholder={searchPlaceholder}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-10 text-sm text-black shadow-sm outline-none placeholder:text-gray-400"
                  />
                </form>
                <Link
                  href="/admin/files/new"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  <FilePlus2 className="h-4 w-4" />
                  Add Car
                </Link>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <FloatingAddButton />
    </div>
  );
}

function FloatingAddButton() {
  return (
    <Link
      href="/admin/files/new"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 lg:hidden"
      title="Add Car"
    >
      <FilePlus2 className="h-5 w-5" />
      Add Car
    </Link>
  );
}
