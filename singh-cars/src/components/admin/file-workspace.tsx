"use client";

import { useMemo, useState } from "react";
import type { AdminFileRecord, ListingDocument, ListingImage } from "@/types";
import {
  removeDocumentAction,
  removeListingImageAction,
  replaceDocumentAction,
  updateBuyerInfoAction,
  updateCarInfoAction,
  updateSellerInfoAction,
  uploadListingImagesAction,
} from "@/app/admin/actions";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid gap-1 rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="text-sm font-medium text-black">{value || "Not added yet"}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-black">{title}</h2>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function getFileName(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "file");
  } catch {
    return "file";
  }
}

function parseBuyerNotes(notes?: string | null) {
  if (!notes) {
    return { address: "", notes: "" };
  }

  if (!notes.startsWith("Address: ")) {
    return { address: "", notes };
  }

  const [firstLine, ...rest] = notes.split("\n");
  const address = firstLine.replace("Address: ", "").trim();
  const cleanNotes = rest.join("\n").trim();

  return { address, notes: cleanNotes };
}

function groupDocuments(documents: ListingDocument[]) {
  const latestByType = new Map<string, ListingDocument>();

  for (const document of documents) {
    latestByType.set(document.docType, document);
  }

  return {
    seller: [latestByType.get("seller_id")].filter(Boolean) as ListingDocument[],
    car: ["rc", "insurance", "loan_noc", "other"]
      .map((docType) => latestByType.get(docType))
      .filter(Boolean) as ListingDocument[],
    buyer: [latestByType.get("buyer_id")].filter(Boolean) as ListingDocument[],
  };
}

const sellerDocumentTypes = [
  { label: "Seller ID", docType: "seller_id" },
];

const carDocumentTypes = [
  { label: "RC", docType: "rc" },
  { label: "Insurance", docType: "insurance" },
  { label: "Loan / NOC", docType: "loan_noc" },
  { label: "Other", docType: "other" },
];

const buyerDocumentTypes = [
  { label: "Buyer ID", docType: "buyer_id" },
];

export function FileWorkspace({ file }: { file: AdminFileRecord }) {
  const [editingSeller, setEditingSeller] = useState(false);
  const [editingCar, setEditingCar] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(false);
  const buyerFields = useMemo(
    () => parseBuyerNotes(file.listing.buyer?.notes),
    [file.listing.buyer?.notes],
  );
  const documents = useMemo(
    () => groupDocuments(file.listing.documents),
    [file.listing.documents],
  );

  return (
    <div className="grid gap-5">
      <SectionCard
        title="Seller Info"
        actions={
          !editingSeller ? (
            <button type="button" className="admin-btn admin-btn-sm" onClick={() => setEditingSeller(true)}>
              Edit
            </button>
          ) : null
        }
      >
        {editingSeller ? (
          <form action={updateSellerInfoAction} className="grid gap-4">
            <input type="hidden" name="listingId" value={file.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Seller Name</span>
                <input className="admin-field" name="sellerName" defaultValue={file.listing.seller?.name ?? ""} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Phone</span>
                <input className="admin-field" name="sellerPhone" defaultValue={file.listing.seller?.phone ?? ""} required />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-800">Address</span>
                <input className="admin-field" name="sellerAddress" defaultValue={file.listing.seller?.address ?? ""} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-800">Notes</span>
                <textarea className="admin-field min-h-[120px]" name="sellerNotes" defaultValue={file.listing.seller?.notes ?? ""} />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn admin-btn-sm" type="submit">Save</button>
              <button type="button" className="admin-btn admin-btn-sm" onClick={() => setEditingSeller(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Seller Name" value={file.listing.seller?.name} />
            <InfoRow label="Phone" value={file.listing.seller?.phone} />
            <div className="md:col-span-2">
              <InfoRow label="Address" value={file.listing.seller?.address} />
            </div>
            <div className="md:col-span-2">
              <InfoRow label="Notes" value={file.listing.seller?.notes} />
            </div>
          </div>
        )}
      </SectionCard>

      <DocumentSection
        title="Seller Documents"
        listingId={file.id}
        documentTypes={sellerDocumentTypes}
        documents={documents.seller}
      />

      <SectionCard
        title="Car Info"
        actions={
          !editingCar ? (
            <button type="button" className="admin-btn admin-btn-sm" onClick={() => setEditingCar(true)}>
              Edit
            </button>
          ) : null
        }
      >
        {editingCar ? (
          <form action={updateCarInfoAction} className="grid gap-4">
            <input type="hidden" name="listingId" value={file.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">File Number</span>
                <input className="admin-field" name="stockNumber" defaultValue={file.listing.stockNumber} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Number Plate</span>
                <input className="admin-field" name="numberPlate" defaultValue={file.listing.numberPlate} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Make</span>
                <input className="admin-field" name="make" defaultValue={file.listing.make} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Model</span>
                <input className="admin-field" name="model" defaultValue={file.listing.model} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Variant</span>
                <input className="admin-field" name="variant" defaultValue={file.listing.variant ?? ""} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Year</span>
                <input className="admin-field" type="number" name="year" defaultValue={file.listing.year} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">KM Driven</span>
                <input className="admin-field" type="number" name="kmDriven" defaultValue={file.listing.kmDriven} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Fuel</span>
                <input className="admin-field" name="fuel" defaultValue={file.listing.fuel} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Transmission</span>
                <input className="admin-field" name="transmission" defaultValue={file.listing.transmission} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Price</span>
                <input className="admin-field" type="number" name="price" defaultValue={file.listing.price} required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Color</span>
                <input className="admin-field" name="color" defaultValue={file.listing.color ?? ""} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Status</span>
                <select className="admin-field" name="status" defaultValue={file.listing.status}>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="sold">Sold</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-800">Location</span>
                <input className="admin-field" name="location" defaultValue={file.listing.location} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-800">Notes / Description</span>
                <textarea className="admin-field min-h-[120px]" name="description" defaultValue={file.listing.description ?? ""} />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn admin-btn-sm" type="submit">Save</button>
              <button type="button" className="admin-btn admin-btn-sm" onClick={() => setEditingCar(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoRow label="File Number" value={file.listing.stockNumber} />
            <InfoRow label="Number Plate" value={file.listing.numberPlate} />
            <InfoRow label="Make" value={file.listing.make} />
            <InfoRow label="Model" value={file.listing.model} />
            <InfoRow label="Variant" value={file.listing.variant} />
            <InfoRow label="Year" value={file.listing.year} />
            <InfoRow label="KM Driven" value={file.listing.kmDriven} />
            <InfoRow label="Fuel" value={file.listing.fuel} />
            <InfoRow label="Transmission" value={file.listing.transmission} />
            <InfoRow label="Price" value={file.listing.price} />
            <InfoRow label="Color" value={file.listing.color} />
            <InfoRow label="Status" value={file.listing.status} />
            <div className="md:col-span-2 xl:col-span-3">
              <InfoRow label="Location" value={file.listing.location} />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <InfoRow label="Notes / Description" value={file.listing.description} />
            </div>
          </div>
        )}
      </SectionCard>

      <DocumentSection
        title="Car Documents"
        listingId={file.id}
        documentTypes={carDocumentTypes}
        documents={documents.car}
      />

      <PhotoSection listingId={file.id} images={file.listing.images} />

      <SectionCard
        title="Buyer Info"
        actions={
          !editingBuyer ? (
            <button type="button" className="admin-btn admin-btn-sm" onClick={() => setEditingBuyer(true)}>
              Edit
            </button>
          ) : null
        }
      >
        {editingBuyer ? (
          <form action={updateBuyerInfoAction} className="grid gap-4">
            <input type="hidden" name="listingId" value={file.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Buyer Name</span>
                <input className="admin-field" name="buyerName" defaultValue={file.listing.buyer?.name ?? ""} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Phone</span>
                <input className="admin-field" name="buyerPhone" defaultValue={file.listing.buyer?.phone ?? ""} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-800">Address</span>
                <input className="admin-field" name="buyerAddress" defaultValue={buyerFields.address} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Sale Date</span>
                <input className="admin-field" type="date" name="saleDate" defaultValue={file.listing.buyer?.saleDate ?? ""} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Sold Price</span>
                <input className="admin-field" type="number" name="soldPrice" defaultValue={file.listing.buyer?.soldPrice ?? ""} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-800">Notes</span>
                <textarea className="admin-field min-h-[120px]" name="buyerNotes" defaultValue={buyerFields.notes} />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn admin-btn-sm" type="submit">Save</button>
              <button type="button" className="admin-btn admin-btn-sm" onClick={() => setEditingBuyer(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Buyer Name" value={file.listing.buyer?.name} />
            <InfoRow label="Phone" value={file.listing.buyer?.phone} />
            <InfoRow label="Address" value={buyerFields.address} />
            <InfoRow label="Sale Date" value={file.listing.buyer?.saleDate} />
            <InfoRow label="Sold Price" value={file.listing.buyer?.soldPrice} />
            <div className="md:col-span-2">
              <InfoRow label="Notes" value={buyerFields.notes} />
            </div>
          </div>
        )}
      </SectionCard>

      <DocumentSection
        title="Buyer Documents"
        listingId={file.id}
        documentTypes={buyerDocumentTypes}
        documents={documents.buyer}
      />
    </div>
  );
}

function DocumentSection({
  title,
  listingId,
  documentTypes,
  documents,
}: {
  title: string;
  listingId: string;
  documentTypes: { label: string; docType: string }[];
  documents: ListingDocument[];
}) {
  return (
    <SectionCard title={title}>
      <div className="grid gap-4">
        {documentTypes.map((item) => {
          const document = documents.find((entry) => entry.docType === item.docType);

          return (
            <div key={item.docType} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black">{item.label}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {document ? getFileName(document.fileUrl) : "No file uploaded yet"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {document ? (
                    <a href={document.fileUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-sm">
                      Open
                    </a>
                  ) : null}
                  <form action={removeDocumentAction}>
                    <input type="hidden" name="listingId" value={listingId} />
                    <input type="hidden" name="docType" value={item.docType} />
                    <button type="submit" className="admin-btn admin-btn-sm admin-btn-danger" disabled={!document}>
                      Remove File
                    </button>
                  </form>
                </div>
              </div>

              <form action={replaceDocumentAction} className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                <input type="hidden" name="listingId" value={listingId} />
                <input type="hidden" name="docType" value={item.docType} />
                <input className="admin-field" type="file" name="file" required />
                <button type="submit" className="admin-btn admin-btn-sm">
                  {document ? "Replace File" : `Upload ${item.label}`}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function PhotoSection({
  listingId,
  images,
}: {
  listingId: string;
  images: ListingImage[];
}) {
  return (
    <SectionCard title="Car Photos">
      <form action={uploadListingImagesAction} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="hidden" name="listingId" value={listingId} />
        <label className="text-sm font-semibold text-black">Upload car photos</label>
        <input className="admin-field" type="file" name="images" multiple accept="image/*" required />
        <div>
          <button type="submit" className="admin-btn admin-btn-sm">
            Upload Car Photos
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.length ? (
          images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt="Car photo" className="h-52 w-full object-cover" />
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-sm text-gray-600">{getFileName(image.imageUrl)}</p>
                <form action={removeListingImageAction}>
                  <input type="hidden" name="listingId" value={listingId} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <button type="submit" className="admin-btn admin-btn-sm admin-btn-danger">
                    Remove
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500">
            No car photos uploaded yet.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
