"use client";

import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { CarFront, Check, ChevronDown, CircleUserRound, IndianRupee } from "lucide-react";
import type { AdminFileRecord, ListingDocument } from "@/types";
import {
  removeDocumentAction,
  removeListingImageAction,
  replaceDocumentAction,
  updateBuyerInfoAction,
  updateCarInfoAction,
  updateSellerInfoAction,
  uploadListingImagesAction,
} from "@/app/admin/actions";

type FileStep = "seller" | "car" | "buyer";

function getFileName(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "file");
  } catch {
    return "file";
  }
}

function formatPrice(value?: number | null) {
  if (!value) {
    return "Price not added";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
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

function getLatestDocument(documents: ListingDocument[], docType: string) {
  return documents.find((document) => document.docType === docType) ?? null;
}

function UploadPicker({
  action,
  listingId,
  buttonLabel,
  inputName,
  accept,
  multiple = false,
  extraFields,
}: {
  action: (formData: FormData) => void | Promise<void>;
  listingId: string;
  buttonLabel: string;
  inputName: string;
  accept?: string;
  multiple?: boolean;
  extraFields?: { name: string; value: string }[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form action={action}>
      <input type="hidden" name="listingId" value={listingId} />
      {extraFields?.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      <input
        ref={inputRef}
        type="file"
        name={inputName}
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);

          if (!files.length) {
            return;
          }

          event.currentTarget.form?.requestSubmit();
        }}
      />
      <button
        type="button"
        className="admin-btn h-12 px-4 text-sm"
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </button>
    </form>
  );
}

function ProgressStep({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-black bg-black text-white"
          : done
            ? "border-gray-300 bg-gray-50 text-black"
            : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
          active
            ? "border-white/30 bg-white/10 text-white"
            : done
              ? "border-gray-300 bg-white text-black"
              : "border-gray-200 bg-white text-gray-500"
        }`}
      >
        {done ? <Check className="h-4 w-4" /> : label.charAt(0)}
      </span>
      {label}
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-black">{value}</p>
    </div>
  );
}

function StepShell({
  icon,
  title,
  summary,
  emptyText,
  actionLabel,
  isOpen,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  summary: ReactNode;
  emptyText: string;
  actionLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-black">
              {icon}
            </div>
            <div>
              <p className="text-lg font-semibold text-black">{title}</p>
              <p className="text-sm text-gray-600">{emptyText}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">{summary}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="admin-btn h-12 px-5 text-sm">{actionLabel}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-black">
            <ChevronDown className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`} />
          </span>
        </div>
      </button>

      {isOpen ? <div className="border-t border-gray-200 px-5 py-5">{children}</div> : null}
    </section>
  );
}

function DocRow({
  title,
  document,
  listingId,
  docType,
}: {
  title: string;
  document: ListingDocument | null;
  listingId: string;
  docType: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black">{title}</p>
          <p className="mt-1 truncate text-sm text-gray-600">
            {document ? getFileName(document.fileUrl) : "No file uploaded yet"}
          </p>
        </div>
        {document ? (
          <div className="flex flex-wrap gap-2">
            <a href={document.fileUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-sm">
              Open
            </a>
            <form action={removeDocumentAction}>
              <input type="hidden" name="listingId" value={listingId} />
              <input type="hidden" name="docType" value={docType} />
              <button type="submit" className="admin-btn admin-btn-sm">
                Remove
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FileWorkspace({ file }: { file: AdminFileRecord }) {
  const sellerDoc = useMemo(
    () => getLatestDocument(file.listing.documents, "seller_id"),
    [file.listing.documents],
  );
  const buyerDoc = useMemo(
    () => getLatestDocument(file.listing.documents, "buyer_id"),
    [file.listing.documents],
  );
  const buyerFields = useMemo(
    () => parseBuyerNotes(file.listing.buyer?.notes),
    [file.listing.buyer?.notes],
  );
  const photos = file.listing.images;
  const sellerDone = Boolean(file.listing.seller?.name && file.listing.seller?.phone);
  const carDone = Boolean(file.listing.model && file.listing.numberPlate && file.listing.price);
  const showBuyerStep = file.listing.status === "sold";
  const buyerDone = Boolean(
    file.listing.buyer?.name && file.listing.buyer?.phone && file.listing.buyer?.soldPrice,
  );
  const defaultStep: FileStep = showBuyerStep
    ? !sellerDone
      ? "seller"
      : !carDone
        ? "car"
        : "buyer"
    : !sellerDone
      ? "seller"
      : "car";
  const [activeStep, setActiveStep] = useState<FileStep>(defaultStep);

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <ProgressStep label="Seller" active={activeStep === "seller"} done={sellerDone} />
          <span className="text-gray-300">→</span>
          <ProgressStep label="Car" active={activeStep === "car"} done={carDone} />
          <span className="text-gray-300">→</span>
          <ProgressStep label="Buyer" active={activeStep === "buyer"} done={buyerDone} />
        </div>
      </section>

      <StepShell
        icon={<CircleUserRound className="h-5 w-5" />}
        title="Step 1 — Seller"
        emptyText={sellerDone ? "Seller details are saved." : "No seller added"}
        actionLabel={sellerDone ? "Edit Seller" : "+ Add Seller"}
        isOpen={activeStep === "seller"}
        onToggle={() => setActiveStep("seller")}
        summary={
          <>
            <SummaryLine
              label="Seller Name"
              value={file.listing.seller?.name?.trim() || "No seller added"}
            />
            <SummaryLine
              label="Phone"
              value={file.listing.seller?.phone?.trim() || "No seller added"}
            />
          </>
        }
      >
        <form action={updateSellerInfoAction} className="grid gap-4">
          <input type="hidden" name="listingId" value={file.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Name</span>
              <input
                className="admin-field h-12"
                name="sellerName"
                defaultValue={file.listing.seller?.name ?? ""}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Phone</span>
              <input
                className="admin-field h-12"
                name="sellerPhone"
                defaultValue={file.listing.seller?.phone ?? ""}
                required
              />
            </label>
          </div>
          <input type="hidden" name="sellerAddress" value={file.listing.seller?.address ?? ""} />
          <input type="hidden" name="sellerNotes" value={file.listing.seller?.notes ?? ""} />

          <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-black">Seller documents</p>
                <p className="text-sm text-gray-600">
                  {sellerDoc ? "Seller docs uploaded" : "No seller docs uploaded yet"}
                </p>
              </div>
              <UploadPicker
                action={replaceDocumentAction}
                listingId={file.id}
                buttonLabel="Upload Seller Docs"
                inputName="file"
                extraFields={[{ name: "docType", value: "seller_id" }]}
              />
            </div>

            <DocRow
              title="Seller docs"
              document={sellerDoc}
              listingId={file.id}
              docType="seller_id"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="admin-btn h-12 px-5 text-base">
              Save Seller
            </button>
            <button
              type="button"
              className="admin-btn h-12 px-5 text-base"
              onClick={() => setActiveStep("car")}
            >
              Cancel
            </button>
          </div>
        </form>
      </StepShell>

      <StepShell
        icon={<CarFront className="h-5 w-5" />}
        title="Step 2 — Car"
        emptyText={carDone ? "Car details are saved." : "No car details added"}
        actionLabel={carDone ? "Edit Car" : "+ Add Car"}
        isOpen={activeStep === "car"}
        onToggle={() => setActiveStep("car")}
        summary={
          <>
            <SummaryLine
              label="Number Plate"
              value={file.listing.numberPlate?.trim() || "No car details added"}
            />
            <SummaryLine
              label="Model"
              value={file.carName?.trim() || "No car details added"}
            />
            <SummaryLine label="Price" value={formatPrice(file.listing.price)} />
            <SummaryLine
              label="Status"
              value={file.status === "sold" ? "Sold" : file.status === "booked" ? "Booked" : "Available"}
            />
          </>
        }
      >
        <form action={updateCarInfoAction} className="grid gap-4">
          <input type="hidden" name="listingId" value={file.id} />
          <input type="hidden" name="stockNumber" value={file.listing.stockNumber} />
          <input type="hidden" name="variant" value={file.listing.variant ?? ""} />
          <input type="hidden" name="color" value={file.listing.color ?? ""} />
          <input type="hidden" name="location" value={file.listing.location ?? ""} />
          <input type="hidden" name="description" value={file.listing.description ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Number Plate</span>
              <input
                className="admin-field h-12"
                name="numberPlate"
                defaultValue={file.listing.numberPlate}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Make</span>
              <input
                className="admin-field h-12"
                name="make"
                defaultValue={file.listing.make}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Model</span>
              <input
                className="admin-field h-12"
                name="model"
                defaultValue={file.listing.model}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Year</span>
              <input
                className="admin-field h-12"
                type="number"
                name="year"
                defaultValue={file.listing.year}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">KM</span>
              <input
                className="admin-field h-12"
                type="number"
                name="kmDriven"
                defaultValue={file.listing.kmDriven}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Fuel</span>
              <input
                className="admin-field h-12"
                name="fuel"
                defaultValue={file.listing.fuel}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Transmission</span>
              <input
                className="admin-field h-12"
                name="transmission"
                defaultValue={file.listing.transmission}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Price</span>
              <input
                className="admin-field h-12"
                type="number"
                name="price"
                defaultValue={file.listing.price}
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Status</span>
              <select className="admin-field h-12" name="status" defaultValue={file.listing.status}>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="sold">Sold</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-black">Car photos</p>
                <p className="text-sm text-gray-600">
                  {photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} uploaded` : "No car photos uploaded yet"}
                </p>
              </div>
              <UploadPicker
                action={uploadListingImagesAction}
                listingId={file.id}
                buttonLabel="Upload Car Photos"
                inputName="images"
                accept="image/*"
                multiple
              />
            </div>

            {photos.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {photos.map((image) => (
                  <article key={image.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.imageUrl} alt="Car photo" className="h-40 w-full object-cover" />
                    <div className="grid gap-3 p-3">
                      <p className="truncate text-sm text-gray-600">{getFileName(image.imageUrl)}</p>
                      <form action={removeListingImageAction}>
                        <input type="hidden" name="listingId" value={file.id} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <button type="submit" className="admin-btn admin-btn-sm w-full justify-center">
                          Remove Photo
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-600">
                No car photos uploaded yet
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="admin-btn h-12 px-5 text-base">
              Save Car
            </button>
            <button
              type="button"
              className="admin-btn h-12 px-5 text-base"
              onClick={() => setActiveStep(showBuyerStep ? "buyer" : "seller")}
            >
              Cancel
            </button>
          </div>
        </form>
      </StepShell>

      {showBuyerStep ? (
        <StepShell
          icon={<IndianRupee className="h-5 w-5" />}
          title="Step 3 — Buyer"
          emptyText={buyerDone ? "Buyer details are saved." : "No buyer added"}
          actionLabel={buyerDone ? "Edit Buyer" : "+ Add Buyer"}
          isOpen={activeStep === "buyer"}
          onToggle={() => setActiveStep("buyer")}
          summary={
            <>
              <SummaryLine
                label="Buyer Name"
                value={file.listing.buyer?.name?.trim() || "No buyer added"}
              />
              <SummaryLine
                label="Phone"
                value={file.listing.buyer?.phone?.trim() || "No buyer added"}
              />
              <SummaryLine
                label="Sold Price"
                value={file.listing.buyer?.soldPrice ? formatPrice(file.listing.buyer.soldPrice) : "No buyer added"}
              />
              <SummaryLine label="Docs" value={buyerDoc ? "Buyer docs uploaded" : "No buyer docs uploaded yet"} />
            </>
          }
        >
          <form action={updateBuyerInfoAction} className="grid gap-4">
            <input type="hidden" name="listingId" value={file.id} />
            <input type="hidden" name="buyerAddress" value={buyerFields.address} />
            <input type="hidden" name="buyerNotes" value={buyerFields.notes} />
            <input type="hidden" name="saleDate" value={file.listing.buyer?.saleDate ?? ""} />

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Buyer Name</span>
                <input
                  className="admin-field h-12"
                  name="buyerName"
                  defaultValue={file.listing.buyer?.name ?? ""}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Phone</span>
                <input
                  className="admin-field h-12"
                  name="buyerPhone"
                  defaultValue={file.listing.buyer?.phone ?? ""}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Sold Price</span>
                <input
                  className="admin-field h-12"
                  type="number"
                  name="soldPrice"
                  defaultValue={file.listing.buyer?.soldPrice ?? ""}
                />
              </label>
            </div>

            <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-black">Buyer documents</p>
                  <p className="text-sm text-gray-600">
                    {buyerDoc ? "Buyer docs uploaded" : "No buyer docs uploaded yet"}
                  </p>
                </div>
                <UploadPicker
                  action={replaceDocumentAction}
                  listingId={file.id}
                  buttonLabel="Upload Buyer Docs"
                  inputName="file"
                  extraFields={[{ name: "docType", value: "buyer_id" }]}
                />
              </div>

              <DocRow
                title="Buyer docs"
                document={buyerDoc}
                listingId={file.id}
                docType="buyer_id"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="admin-btn h-12 px-5 text-base">
                Save Buyer
              </button>
              <button
                type="button"
                className="admin-btn h-12 px-5 text-base"
                onClick={() => setActiveStep("car")}
              >
                Cancel
              </button>
            </div>
          </form>
        </StepShell>
      ) : null}
    </div>
  );
}
