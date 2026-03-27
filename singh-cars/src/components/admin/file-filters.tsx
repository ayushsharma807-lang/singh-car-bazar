import Link from "next/link";

export function FileFilters({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <form className="grid gap-4 rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm md:grid-cols-4">
      <input
        className="field"
        name="query"
        defaultValue={searchParams.query}
        placeholder="Search file number, plate, seller, buyer, phone"
      />
      <select className="field" name="status" defaultValue={searchParams.status}>
        <option value="">All statuses</option>
        <option value="available">Available</option>
        <option value="booked">Booked</option>
        <option value="sold">Sold</option>
      </select>
      <select className="field" name="sellerType" defaultValue={searchParams.sellerType}>
        <option value="">All seller types</option>
        <option value="dealer">Dealer</option>
        <option value="private">Private</option>
      </select>
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-full bg-[#2252e8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
        >
          Search
        </button>
        <Link
          href="/admin/files"
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
