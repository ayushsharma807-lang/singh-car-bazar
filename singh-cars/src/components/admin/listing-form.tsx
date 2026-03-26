import { saveListingAction } from "@/app/admin/actions";
import type { Listing } from "@/types";

type ListingFormProps = {
  listing?: Listing | null;
};

const documentFields = [
  { label: "RC", name: "document_rc" },
  { label: "Insurance", name: "document_insurance" },
  { label: "Seller ID", name: "document_seller_id" },
  { label: "Buyer ID", name: "document_buyer_id" },
  { label: "Loan / NOC", name: "document_loan_noc" },
  { label: "Other Files", name: "document_other" },
];

export function ListingForm({ listing }: ListingFormProps) {
  const featuredImageUrl =
    listing?.images.find((image) => image.isFeatured)?.imageUrl ?? "";

  return (
    <form
      action={saveListingAction}
      className="grid gap-8 rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]"
    >
      <input type="hidden" name="listingId" value={listing?.id ?? ""} />
      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff8a2e]">
            Seller Details
          </p>
          <div className="mt-5 grid gap-4">
            <select className="admin-field" name="sellerType" defaultValue={listing?.sellerType ?? "dealer"}>
              <option value="dealer">Dealer</option>
              <option value="private">Private</option>
            </select>
            <input className="admin-field" name="sellerName" defaultValue={listing?.seller.name ?? ""} placeholder="Seller name" />
            <input className="admin-field" name="sellerPhone" defaultValue={listing?.seller.phone ?? ""} placeholder="Seller phone" />
            <input className="admin-field" name="sellerAddress" defaultValue={listing?.seller.address ?? ""} placeholder="Optional address" />
            <textarea className="admin-field min-h-[120px]" name="sellerNotes" defaultValue={listing?.seller.notes ?? ""} placeholder="Optional notes" />
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff8a2e]">
            Car Details
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="admin-field" name="stockNumber" defaultValue={listing?.stockNumber ?? ""} placeholder="Stock / file number" required />
            <input className="admin-field" name="numberPlate" defaultValue={listing?.numberPlate ?? ""} placeholder="Number plate" required />
            <input className="admin-field" name="make" defaultValue={listing?.make ?? ""} placeholder="Make" required />
            <input className="admin-field" name="model" defaultValue={listing?.model ?? ""} placeholder="Model" required />
            <input className="admin-field" name="variant" defaultValue={listing?.variant ?? ""} placeholder="Variant" />
            <input className="admin-field" type="number" name="year" defaultValue={listing?.year ?? ""} placeholder="Year" required />
            <input className="admin-field" name="fuel" defaultValue={listing?.fuel ?? ""} placeholder="Fuel" required />
            <input className="admin-field" name="transmission" defaultValue={listing?.transmission ?? ""} placeholder="Transmission" required />
            <input className="admin-field" type="number" name="kmDriven" defaultValue={listing?.kmDriven ?? ""} placeholder="KM driven" required />
            <input className="admin-field" name="color" defaultValue={listing?.color ?? ""} placeholder="Color" />
            <input className="admin-field" type="number" name="ownerNumber" defaultValue={listing?.ownerNumber ?? ""} placeholder="Owner number" />
            <input className="admin-field" type="number" name="registrationYear" defaultValue={listing?.registrationYear ?? ""} placeholder="Registration year" />
            <input className="admin-field" type="number" name="price" defaultValue={listing?.price ?? ""} placeholder="Price" required />
            <input className="admin-field" name="location" defaultValue={listing?.location ?? ""} placeholder="Location" required />
            <select className="admin-field" name="status" defaultValue={listing?.status ?? "available"}>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
            <label className="flex items-center gap-3 rounded-[18px] border border-white/10 px-4 py-3 text-sm text-slate-300">
              <input type="checkbox" name="featured" defaultChecked={listing?.featured ?? false} />
              Mark as featured
            </label>
            <label className="flex items-center gap-3 rounded-[18px] border border-white/10 px-4 py-3 text-sm text-slate-300 md:col-span-2">
              <input type="checkbox" name="isPublished" defaultChecked={listing?.isPublished ?? true} />
              Publish on website
            </label>
            <textarea className="admin-field min-h-[140px] md:col-span-2" name="description" defaultValue={listing?.description ?? ""} placeholder="Description" />
            <input className="admin-field md:col-span-2" name="featuredImageUrl" defaultValue={featuredImageUrl} placeholder="Featured image URL (optional for existing image)" />
            <div className="md:col-span-2 rounded-[18px] border border-dashed border-white/15 p-4">
              <p className="text-sm text-slate-400">Upload multiple car photos. If no featured image URL is selected, the first uploaded photo becomes the cover.</p>
              <input className="mt-3 block text-sm text-slate-300" type="file" name="images" multiple accept="image/*" />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff8a2e]">
            Buyer Details
          </p>
          <div className="mt-5 grid gap-4">
            <input className="admin-field" name="buyerName" defaultValue={listing?.buyer?.name ?? ""} placeholder="Buyer name" />
            <input className="admin-field" name="buyerPhone" defaultValue={listing?.buyer?.phone ?? ""} placeholder="Buyer phone" />
            <input className="admin-field" type="date" name="saleDate" defaultValue={listing?.buyer?.saleDate ?? ""} />
            <input className="admin-field" type="number" name="soldPrice" defaultValue={listing?.buyer?.soldPrice ?? ""} placeholder="Sold price" />
            <textarea className="admin-field min-h-[120px]" name="buyerNotes" defaultValue={listing?.buyer?.notes ?? ""} placeholder="Buyer notes" />
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff8a2e]">
            Documents
          </p>
          <div className="mt-5 grid gap-4">
            {documentFields.map((field) => (
              <label key={field.name} className="rounded-[18px] border border-white/10 p-4 text-sm text-slate-300">
                <span>{field.label}</span>
                <input className="mt-3 block w-full text-sm text-slate-300" type="file" name={field.name} />
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-4">
        <button className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
          Save Listing
        </button>
      </div>
    </form>
  );
}
