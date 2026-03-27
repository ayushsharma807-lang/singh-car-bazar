import Link from "next/link";

export function FileFilters({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <form className="grid gap-4 rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm md:grid-cols-4">
      {searchParams.missing ? <input type="hidden" name="missing" value={searchParams.missing} /> : null}
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
          className="admin-btn flex-1"
        >
          Search
        </button>
        <Link
          href="/admin/files"
          className="admin-btn"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
