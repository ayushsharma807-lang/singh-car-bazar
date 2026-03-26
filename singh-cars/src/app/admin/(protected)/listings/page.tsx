import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminListings } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

type AdminListingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminListingsPage({
  searchParams,
}: AdminListingsPageProps) {
  const params = await searchParams;
  const listings = await getAdminListings({
    search: typeof params.search === "string" ? params.search : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    sellerType:
      typeof params.sellerType === "string" ? params.sellerType : undefined,
  });

  return (
    <AdminShell title="Listings Management">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 md:grid-cols-3">
          <input className="admin-field" name="search" placeholder="Search file number / number plate" defaultValue={typeof params.search === "string" ? params.search : ""} />
          <select className="admin-field" name="status" defaultValue={typeof params.status === "string" ? params.status : ""}>
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="sold">Sold</option>
          </select>
          <select className="admin-field" name="sellerType" defaultValue={typeof params.sellerType === "string" ? params.sellerType : ""}>
            <option value="">All seller types</option>
            <option value="dealer">Dealer</option>
            <option value="private">Private</option>
          </select>
          <div className="md:col-span-3">
            <button className="rounded-full bg-[#2252e8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Apply Filters
            </button>
          </div>
        </form>
        <Link href="/admin/listings/new" className="rounded-full bg-[#ff8a2e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
          Add Car
        </Link>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              {["Stock", "Number Plate", "Car", "Status", "Seller Type", "Price", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-4 font-medium uppercase tracking-[0.18em]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/30 text-slate-200">
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="px-4 py-4">{listing.stockNumber}</td>
                <td className="px-4 py-4">{listing.numberPlate}</td>
                <td className="px-4 py-4">{listing.make} {listing.model}</td>
                <td className="px-4 py-4">{listing.status}</td>
                <td className="px-4 py-4">{listing.sellerType}</td>
                <td className="px-4 py-4">{formatPrice(listing.price)}</td>
                <td className="px-4 py-4">
                  <Link href={`/admin/listings/${listing.id}/edit`} className="text-[#ff8a2e]">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
