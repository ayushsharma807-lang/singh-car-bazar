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
    brand: typeof params.brand === "string" ? params.brand : undefined,
    model: typeof params.model === "string" ? params.model : undefined,
    fuel: typeof params.fuel === "string" ? params.fuel : undefined,
    transmission:
      typeof params.transmission === "string" ? params.transmission : undefined,
    year: typeof params.year === "string" ? params.year : undefined,
    price: typeof params.price === "string" ? params.price : undefined,
  };
  const [allListings, listings] = await Promise.all([getListings(), getListings(filters)]);

  const brandOptions = Array.from(new Set(allListings.map((listing) => listing.make))).sort();
  const modelOptions = Array.from(
    new Set(
      allListings
        .filter((listing) =>
          filters.brand ? listing.make.toLowerCase() === filters.brand.toLowerCase() : true,
        )
        .map((listing) => listing.model),
    ),
  ).sort();
  const yearOptions = Array.from(new Set(allListings.map((listing) => listing.year)))
    .sort((left, right) => right - left)
    .map(String);

  return (
    <SiteShell currentPath="/inventory">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Inventory
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
            Available Cars
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
            Browse live available cars in a clean, easy-to-scan stock list and open any vehicle for full details.
          </p>
        </div>
      </section>

      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <form className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <select
                name="brand"
                defaultValue={filters.brand ?? ""}
                className="h-12 rounded-2xl border border-gray-300 bg-white px-4 text-sm text-black outline-none"
              >
                <option value="">All Brands</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <select
                name="model"
                defaultValue={filters.model ?? ""}
                className="h-12 rounded-2xl border border-gray-300 bg-white px-4 text-sm text-black outline-none"
              >
                <option value="">All Models</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <select
                name="year"
                defaultValue={filters.year ?? ""}
                className="h-12 rounded-2xl border border-gray-300 bg-white px-4 text-sm text-black outline-none"
              >
                <option value="">All Years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button className="h-12 rounded-2xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800">
                Search
              </button>
              <Link
                href="/inventory"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-sm font-semibold text-black transition hover:bg-gray-50"
              >
                Reset
              </Link>
            </div>
          </form>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-600">
              {listings.length ? `${formatNumber(listings.length)} cars found` : "No cars found"}
            </p>
            <p className="text-sm text-gray-500">
              Live stock from Singh Car Bazar dealer inventory.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.length ? (
              listings.map((listing) => (
                <InventoryCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <h2 className="text-2xl font-semibold text-black">No Matching Cars</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  Try a different brand, model, or year to browse the full stock list again.
                </p>
                <Link
                  href="/inventory"
                  className="mt-6 inline-flex rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Show All Cars
                </Link>
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              Need Help Finding a Car?
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
