import Link from "next/link";
import { InventoryCard } from "@/components/public/inventory-card";
import { SiteShell } from "@/components/public/site-shell";
import { getListings } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import type { InventoryFilters } from "@/types";

type InventoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const filters: InventoryFilters = {
    search: typeof params.search === "string" ? params.search : undefined,
    brand: typeof params.brand === "string" ? params.brand : undefined,
    fuel: typeof params.fuel === "string" ? params.fuel : undefined,
    transmission:
      typeof params.transmission === "string" ? params.transmission : undefined,
    year: typeof params.year === "string" ? params.year : undefined,
    price: typeof params.price === "string" ? params.price : undefined,
  };
  const listings = await getListings(filters);

  return (
    <SiteShell currentPath="/inventory">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
                Inventory
              </p>
              <h1 className="mt-3 font-display text-5xl uppercase tracking-[0.08em] text-slate-900 sm:text-6xl">
                Available Cars
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                Browse live stock, search quickly, and shortlist the right used car without scrolling through unnecessary content.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[440px]">
              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Cars Showing
                </p>
                <p className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-[#2252e8]">
                  {formatNumber(listings.length)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Buying Help
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Call or WhatsApp for quick assistance.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Fast Contact
                </p>
                <Link href="/contact" className="mt-3 inline-flex text-sm font-semibold text-[#2252e8] hover:underline">
                  Send Inquiry
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(5,1fr)]">
          <input className="field" name="search" placeholder="Search make or model" defaultValue={filters.search ?? ""} />
          <input className="field" name="brand" placeholder="Brand" defaultValue={filters.brand ?? ""} />
          <input className="field" name="fuel" placeholder="Fuel" defaultValue={filters.fuel ?? ""} />
          <input className="field" name="transmission" placeholder="Transmission" defaultValue={filters.transmission ?? ""} />
          <input className="field" name="year" placeholder="Year" defaultValue={filters.year ?? ""} />
          <input className="field" name="price" placeholder="Max Price" defaultValue={filters.price ?? ""} />
          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-6">
            <button className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]">
              Search Cars
            </button>
            <Link
              href="/inventory"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-800 transition hover:border-[#2252e8] hover:text-[#2252e8]"
            >
              Reset Filters
            </Link>
          </div>
        </form>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            {listings.length ? `${formatNumber(listings.length)} cars found` : "No cars found"}
          </p>
          <p className="text-sm text-slate-600">
            Inventory is updated from the live dealer system.
          </p>
        </div>

        {listings.length ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {listings.map((listing) => (
              <InventoryCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-slate-900">
              No Matching Cars
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Try a different brand, year, fuel type, or reset the filters to see all available cars.
            </p>
            <Link
              href="/inventory"
              className="mt-6 inline-flex rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]"
            >
              Show All Cars
            </Link>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
