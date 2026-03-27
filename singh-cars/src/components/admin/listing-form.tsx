"use client";

import { useState } from "react";
import { saveListingAction } from "@/app/admin/actions";
import type { Listing } from "@/types";

type ListingFormProps = {
  listing?: Listing | null;
};

type Step = "seller" | "car" | "save";

const stepOrder: Step[] = ["seller", "car", "save"];

const documentFields = [
  { label: "RC", name: "document_rc" },
  { label: "Insurance", name: "document_insurance" },
  { label: "Seller ID", name: "document_seller_id" },
  { label: "Buyer ID", name: "document_buyer_id" },
  { label: "Loan / NOC", name: "document_loan_noc" },
  { label: "Other Files", name: "document_other" },
];

const stepMeta: Record<Step, { title: string; text: string }> = {
  seller: {
    title: "Step 1: Seller",
    text: "Add the seller name and phone first.",
  },
  car: {
    title: "Step 2: Car",
    text: "Add the main car details and photos.",
  },
  save: {
    title: "Step 3: Save",
    text: "Check the details and save the car file.",
  },
};

function StepButton({
  step,
  activeStep,
  onClick,
}: {
  step: Step;
  activeStep: Step;
  onClick: (step: Step) => void;
}) {
  const isActive = step === activeStep;

  return (
    <button
      type="button"
      onClick={() => onClick(step)}
      className={`rounded-xl border px-5 py-4 text-left transition ${
        isActive
          ? "border-gray-300 bg-gray-50 shadow-sm"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <p className="text-base font-semibold text-black">{stepMeta[step].title}</p>
      <p className="mt-1 text-sm text-gray-600">{stepMeta[step].text}</p>
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-sm font-semibold text-gray-800">{children}</span>;
}

function NextStepButton({
  currentStep,
  setStep,
}: {
  currentStep: Step;
  setStep: (step: Step) => void;
}) {
  const currentIndex = stepOrder.indexOf(currentStep);
  const nextStep = stepOrder[currentIndex + 1];

  if (!nextStep) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setStep(nextStep)}
      className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
    >
      Next
    </button>
  );
}

export function ListingForm({ listing }: ListingFormProps) {
  const [step, setStep] = useState<Step>("seller");
  const coverImageUrl = listing?.coverImageUrl ?? "";
  const isEditing = Boolean(listing);

  return (
    <form
      action={saveListingAction}
      className="grid gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6"
    >
      <input type="hidden" name="listingId" value={listing?.id ?? ""} />

      <div className="grid gap-3 md:grid-cols-3">
        {stepOrder.map((stepKey) => (
          <StepButton key={stepKey} step={stepKey} activeStep={step} onClick={setStep} />
        ))}
      </div>

      {step === "seller" ? (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Seller</p>
          <h2 className="mt-2 text-2xl font-semibold text-black">Who is giving this car?</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>Seller Type</FieldLabel>
              <select className="admin-field h-14" name="sellerType" defaultValue={listing?.sellerType ?? "dealer"}>
                <option value="dealer">Dealer</option>
                <option value="private">Private</option>
              </select>
            </label>
            <label>
              <FieldLabel>Phone</FieldLabel>
              <input
                className="admin-field h-14"
                name="sellerPhone"
                defaultValue={listing?.seller?.phone ?? ""}
                placeholder="Seller phone number"
                required
              />
            </label>
            <label className="md:col-span-2">
              <FieldLabel>Name</FieldLabel>
              <input
                className="admin-field h-14"
                name="sellerName"
                defaultValue={listing?.seller?.name ?? ""}
                placeholder="Seller name"
                required
              />
            </label>
          </div>

          <details className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-black">More details</summary>
            <div className="mt-4 grid gap-4">
              <label>
                <FieldLabel>Address</FieldLabel>
                <input
                  className="admin-field h-14"
                  name="sellerAddress"
                  defaultValue={listing?.seller?.address ?? ""}
                  placeholder="Optional address"
                />
              </label>
              <label>
                <FieldLabel>Notes</FieldLabel>
                <textarea
                  className="admin-field min-h-[120px]"
                  name="sellerNotes"
                  defaultValue={listing?.seller?.notes ?? ""}
                  placeholder="Optional notes"
                />
              </label>
            </div>
          </details>

          <div className="mt-6 flex justify-end">
            <NextStepButton currentStep="seller" setStep={setStep} />
          </div>
        </section>
      ) : null}

      {step === "car" ? (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Car</p>
          <h2 className="mt-2 text-2xl font-semibold text-black">Add the car details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>Make</FieldLabel>
              <input className="admin-field h-14" name="make" defaultValue={listing?.make ?? ""} placeholder="Maruti, Hyundai, Honda..." required />
            </label>
            <label>
              <FieldLabel>Model</FieldLabel>
              <input className="admin-field h-14" name="model" defaultValue={listing?.model ?? ""} placeholder="Swift, Creta, City..." required />
            </label>
            <label>
              <FieldLabel>Variant</FieldLabel>
              <input className="admin-field h-14" name="variant" defaultValue={listing?.variant ?? ""} placeholder="Optional variant" />
            </label>
            <label>
              <FieldLabel>Year</FieldLabel>
              <input className="admin-field h-14" type="number" name="year" defaultValue={listing?.year ?? ""} placeholder="Year" required />
            </label>
            <label>
              <FieldLabel>Fuel</FieldLabel>
              <input className="admin-field h-14" name="fuel" defaultValue={listing?.fuel ?? ""} placeholder="Petrol, Diesel, CNG..." required />
            </label>
            <label>
              <FieldLabel>Transmission</FieldLabel>
              <input className="admin-field h-14" name="transmission" defaultValue={listing?.transmission ?? ""} placeholder="Manual or Automatic" required />
            </label>
            <label>
              <FieldLabel>KM</FieldLabel>
              <input className="admin-field h-14" type="number" name="kmDriven" defaultValue={listing?.kmDriven ?? ""} placeholder="KM driven" required />
            </label>
            <label>
              <FieldLabel>Price</FieldLabel>
              <input className="admin-field h-14" type="number" name="price" defaultValue={listing?.price ?? ""} placeholder="Price" required />
            </label>
            <label>
              <FieldLabel>Number Plate</FieldLabel>
              <input className="admin-field h-14" name="numberPlate" defaultValue={listing?.numberPlate ?? ""} placeholder="Number plate" required />
            </label>
            <label>
              <FieldLabel>Photos</FieldLabel>
              <input className="admin-field h-14 px-4 py-3" type="file" name="images" multiple accept="image/*" />
            </label>
          </div>

          <details className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-black">More details</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label>
                <FieldLabel>File Number</FieldLabel>
                <input
                  className="admin-field h-14"
                  name="stockNumber"
                  defaultValue={listing?.stockNumber ?? ""}
                  placeholder="Office file number"
                  required
                />
              </label>
              <label>
                <FieldLabel>Location</FieldLabel>
                <input className="admin-field h-14" name="location" defaultValue={listing?.location ?? ""} placeholder="Location" required />
              </label>
              <label>
                <FieldLabel>Color</FieldLabel>
                <input className="admin-field h-14" name="color" defaultValue={listing?.color ?? ""} placeholder="Optional color" />
              </label>
              <label>
                <FieldLabel>Owner Number</FieldLabel>
                <input className="admin-field h-14" type="number" name="ownerCount" defaultValue={listing?.ownerCount ?? ""} placeholder="Owner number" />
              </label>
              <label className="md:col-span-2">
                <FieldLabel>Cover Image Link</FieldLabel>
                <input
                  className="admin-field h-14"
                  name="coverImageUrl"
                  defaultValue={coverImageUrl}
                  placeholder="Optional existing image link"
                />
              </label>
              <label className="md:col-span-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  className="admin-field min-h-[120px]"
                  name="description"
                  defaultValue={listing?.description ?? ""}
                  placeholder="Extra notes about the car"
                />
              </label>
              <label>
                <FieldLabel>Car Status</FieldLabel>
                <select className="admin-field h-14" name="status" defaultValue={listing?.status ?? "available"}>
                  <option value="available">In Stock</option>
                  <option value="booked">Booked</option>
                  <option value="sold">Sold</option>
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-4 text-sm font-medium text-gray-800">
                <input type="checkbox" name="featured" defaultChecked={listing?.featured ?? false} />
                Show in featured cars
              </label>
            </div>
          </details>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("seller")}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              Back
            </button>
            <NextStepButton currentStep="car" setStep={setStep} />
          </div>
        </section>
      ) : null}

      {step === "save" ? (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Save</p>
          <h2 className="mt-2 text-2xl font-semibold text-black">Save this car file</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-black">Seller</p>
              <p className="mt-2 text-sm text-gray-600">Name, phone, and seller type are saved in one file.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-black">Car</p>
              <p className="mt-2 text-sm text-gray-600">Main car details and photos are ready to save.</p>
            </div>
          </div>

          <details className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-black">Buyer and documents</summary>
            <div className="mt-4 grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <FieldLabel>Buyer Name</FieldLabel>
                  <input className="admin-field h-14" name="buyerName" defaultValue={listing?.buyer?.name ?? ""} placeholder="Optional buyer name" />
                </label>
                <label>
                  <FieldLabel>Buyer Phone</FieldLabel>
                  <input className="admin-field h-14" name="buyerPhone" defaultValue={listing?.buyer?.phone ?? ""} placeholder="Optional buyer phone" />
                </label>
                <label>
                  <FieldLabel>Sale Date</FieldLabel>
                  <input className="admin-field h-14" type="date" name="saleDate" defaultValue={listing?.buyer?.saleDate ?? ""} />
                </label>
                <label>
                  <FieldLabel>Sold Price</FieldLabel>
                  <input className="admin-field h-14" type="number" name="soldPrice" defaultValue={listing?.buyer?.soldPrice ?? ""} placeholder="Optional sold price" />
                </label>
                <label className="md:col-span-2">
                  <FieldLabel>Buyer Notes</FieldLabel>
                  <textarea className="admin-field min-h-[110px]" name="buyerNotes" defaultValue={listing?.buyer?.notes ?? ""} placeholder="Optional buyer notes" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {documentFields.map((field) => (
                  <label key={field.name} className="rounded-xl border border-gray-200 bg-white p-4">
                    <FieldLabel>{field.label}</FieldLabel>
                    <input className="admin-field h-14 px-4 py-3" type="file" name={field.name} />
                    <input className="admin-field mt-3 h-14" name={`${field.name}_notes`} placeholder={`${field.label} notes`} />
                  </label>
                ))}
              </div>
            </div>
          </details>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("car")}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              Back
            </button>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
              >
                {isEditing ? "Save Changes" : "Save Car"}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                {isEditing ? "Save and Close" : "Add Car"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </form>
  );
}
