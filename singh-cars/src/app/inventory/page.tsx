import { InventoryCard } from "@/components/public/inventory-card";
import { SiteShell } from "@/components/public/site-shell";
import { getListings } from "@/lib/data";
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
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff8a2e]">
              Inventory
            </p>
            <h1 className="mt-3 font-display text-6xl uppercase tracking-[0.08em] text-slate-900">
              Available Cars
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Search and filter live cars by make, model, year, transmission, fuel, and price.
            </p>
          </div>
        </div>

        <form className="mt-10 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-6">
          <input className="field" name="search" placeholder="Search make/model" defaultValue={filters.search ?? ""} />
          <input className="field" name="brand" placeholder="Brand" defaultValue={filters.brand ?? ""} />
          <input className="field" name="fuel" placeholder="Fuel" defaultValue={filters.fuel ?? ""} />
          <input className="field" name="transmission" placeholder="Transmission" defaultValue={filters.transmission ?? ""} />
          <input className="field" name="year" placeholder="Year" defaultValue={filters.year ?? ""} />
          <input className="field" name="price" placeholder="Max Price" defaultValue={filters.price ?? ""} />
          <div className="xl:col-span-6">
            <button className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]">
              Apply Filters
            </button>
          </div>
        </form>

        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {listings.map((listing) => (
            <InventoryCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
