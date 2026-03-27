import Link from "next/link";

export function FileFilters({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <form className="grid gap-4 rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm md:grid-cols-4">
      <input
        className="field h-12"
        name="query"
        defaultValue={searchParams.query}
        placeholder="Search by Number Plate, file no., seller, buyer, phone"
      />
      <select className="field h-12" name="status" defaultValue={searchParams.status}>
        <option value="">All car status</option>
        <option value="available">In Stock</option>
        <option value="booked">Booked</option>
        <option value="sold">Sold</option>
      </select>
      <select className="field h-12" name="sellerType" defaultValue={searchParams.sellerType}>
        <option value="">All seller type</option>
        <option value="dealer">Dealer</option>
        <option value="private">Private</option>
      </select>
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-full bg-[#2252e8] px-5 py-3 text-sm font-semibold text-white"
        >
          Search
        </button>
        <Link
          href="/admin/files"
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
