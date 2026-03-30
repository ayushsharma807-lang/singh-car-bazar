"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, FileImage, FileText, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { UploadSourceButton } from "@/components/admin/upload-source-button";
import {
  normalizeCarPhotoUpload,
  normalizeDocumentUpload,
} from "@/lib/client-image-upload";
import type { Listing } from "@/types";

type ListingFormProps = {
  listing?: Listing | null;
};

type Step = "seller" | "car" | "buyer";

type FormSubmitState = {
  status: "idle" | "success" | "error";
  message?: string;
  redirectTo?: string;
  listingId?: string;
};

const stepOrder: Step[] = ["seller", "car", "buyer"];
const documentAccept = ".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.doc,.docx";
const photoAccept = ".jpg,.jpeg,.png,.webp,.heic,.heif";
const DOCUMENT_MAX_BYTES = 12 * 1024 * 1024;
const PHOTO_MAX_BYTES = 15 * 1024 * 1024;
const uploadFieldNames = [
  "document_seller_id",
  "images",
  "document_rc",
  "document_insurance",
  "document_other",
  "document_buyer_id",
] as const;

const carDocumentFields = [
  { label: "RC", name: "document_rc", accept: documentAccept },
  { label: "Insurance", name: "document_insurance", accept: documentAccept },
  { label: "Other Papers", name: "document_other", accept: documentAccept },
] as const;

const stepMeta: Record<Step, { title: string; text: string; icon: typeof UserRound }> = {
  seller: {
    title: "Seller",
    text: "Name, phone, and seller papers",
    icon: UserRound,
  },
  car: {
    title: "Car",
    text: "Car details, photos, and papers",
    icon: FileImage,
  },
  buyer: {
    title: "Buyer",
    text: "Buyer details and buyer papers",
    icon: FileText,
  },
};

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-sm font-semibold text-gray-800">{children}</span>;
}

function parseBuyerNotes(notes?: string | null) {
  if (!notes) {
    return { address: "", notes: "" };
  }

  if (!notes.startsWith("Address: ")) {
    return { address: "", notes };
  }

  const [firstLine, ...rest] = notes.split("\n");

  return {
    address: firstLine.replace("Address: ", "").trim(),
    notes: rest.join("\n").trim(),
  };
}

function StepPill({
  step,
  activeStep,
  onClick,
}: {
  step: Step;
  activeStep: Step;
  onClick: (step: Step) => void;
}) {
  const isActive = step === activeStep;
  const isDone = stepOrder.indexOf(step) < stepOrder.indexOf(activeStep);
  const Icon = stepMeta[step].icon;

  return (
    <button
      type="button"
      onClick={() => onClick(step)}
      className={`flex min-w-0 items-center gap-2 rounded-full border px-3 py-2 text-left text-sm font-semibold transition ${
        isActive
          ? "border-black bg-black text-white"
          : isDone
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full border ${
          isActive
            ? "border-white/20 bg-white/10 text-white"
            : isDone
              ? "border-green-200 bg-white text-green-700"
              : "border-gray-200 bg-white text-gray-500"
        }`}
      >
        {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="truncate">{stepMeta[step].title}</span>
    </button>
  );
}

function UploadCard({
  label,
  helper,
  name,
  accept,
  multiple = false,
  files,
  onFilesChange,
  onRemoveFile,
}: {
  label: string;
  helper: string;
  name: string;
  accept: string;
  multiple?: boolean;
  files?: File[];
  onFilesChange: (name: string, sourceKey: string, files: FileList | null) => void;
  onRemoveFile: (name: string, index: number) => void;
}) {
  const fileCount = files?.length || 0;
  const selectedText = fileCount
    ? fileCount === 1
      ? files?.[0]?.name || helper
      : `${fileCount} files selected`
    : helper;
  const isPhotoField = name === "images";
  const sheetTitle = isPhotoField ? "Add car photos" : label;

  return (
    <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div>
        <p className="text-sm font-semibold text-black">{label}</p>
        <p className="mt-1 text-sm text-gray-600">{selectedText}</p>
      </div>
      <UploadSourceButton
        buttonLabel={fileCount ? "Add More Files" : "Choose Source"}
        sheetTitle={sheetTitle}
        desktopSourceKey="files"
        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black"
        options={
          isPhotoField
            ? [
                {
                  key: "camera",
                  label: "Camera",
                  hint: "Take a new photo now",
                  accept: "image/*",
                  capture: "environment",
                  multiple: false,
                },
                {
                  key: "gallery",
                  label: "Gallery",
                  hint: multiple ? "Choose one or more images" : "Choose an image",
                  accept: "image/*",
                  multiple,
                },
                {
                  key: "files",
                  label: "Files",
                  hint: "Pick images from device files",
                  accept: "image/*",
                  multiple,
                },
              ]
            : [
                {
                  key: "camera",
                  label: "Camera",
                  hint: "Scan with the camera",
                  accept: "image/*",
                  capture: "environment",
                  multiple: false,
                },
                {
                  key: "gallery",
                  label: "Gallery",
                  hint: multiple ? "Choose one or more images" : "Choose an image",
                  accept: "image/*",
                  multiple,
                },
                {
                  key: "files",
                  label: "Files",
                  hint: "Pick PDF or documents",
                  accept,
                  multiple,
                },
              ]
        }
        onFilesSelected={(sourceKey, fileList) => onFilesChange(name, sourceKey, fileList)}
      />
      {fileCount ? (
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            {fileCount} file{fileCount > 1 ? "s" : ""} selected
          </p>
          <div className="grid gap-2">
            {files?.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-black">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {Math.max(1, Math.round(file.size / 1024))} KB
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500"
                  onClick={() => onRemoveFile(name, index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const isEditing = Boolean(listing);
  const defaultStatus = listing?.status ?? "available";
  const buyerDraft = parseBuyerNotes(listing?.buyer?.notes);
  const [state, setState] = useState<FormSubmitState>({ status: "idle" });
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState<Step>("seller");
  const [localMessage, setLocalMessage] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});

  useEffect(() => {
    if (state.status !== "success" || !state.redirectTo) {
      return;
    }

    router.push(state.redirectTo);
    router.refresh();
  }, [router, state.redirectTo, state.status]);

  function goToStep(nextStep: Step) {
    setLocalMessage("");
    setStep(nextStep);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function updateSelectedFiles(name: string, sourceKey: string, files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const incomingFiles = Array.from(files);

    setSelectedFiles((current) => {
      const existingFiles = current[name] ?? [];
      const nextFiles =
        sourceKey === "camera"
          ? [...existingFiles, ...incomingFiles]
          : [...existingFiles, ...incomingFiles];

      const deduped = nextFiles.filter(
        (file, index, items) =>
          items.findIndex(
            (entry) =>
              entry.name === file.name &&
              entry.size === file.size &&
              entry.lastModified === file.lastModified,
          ) === index,
      );

      return {
        ...current,
        [name]: deduped,
      };
    });
  }

  function removeSelectedFile(name: string, indexToRemove: number) {
    setSelectedFiles((current) => {
      const existingFiles = current[name] ?? [];
      const nextFiles = existingFiles.filter((_, index) => index !== indexToRemove);

      if (!nextFiles.length) {
        const next = { ...current };
        delete next[name];
        return next;
      }

      return {
        ...current,
        [name]: nextFiles,
      };
    });
  }

  function readField(name: string) {
    if (!formRef.current) {
      return "";
    }

    const formData = new FormData(formRef.current);
    return String(formData.get(name) || "").trim();
  }

  function continueFromSeller() {
    const sellerName = readField("sellerName");
    const sellerPhone = readField("sellerPhone");

    if (!sellerName || !sellerPhone) {
      setLocalMessage("Add seller name and phone first.");
      return;
    }

    goToStep("car");
  }

  function continueFromCar() {
    const make = readField("make");
    const model = readField("model");
    const numberPlate = readField("numberPlate");
    const year = readField("year");
    const fuel = readField("fuel");
    const transmission = readField("transmission");
    const price = readField("price");

    if (!make || !model || !numberPlate || !year || !fuel || !transmission || !price) {
      setLocalMessage("Add car name, number plate, year, fuel, gear, and price first.");
      return;
    }

    goToStep("buyer");
  }

  async function uploadFilesForListing(listingId: string) {
    const uploadPlans = [
      {
        field: "document_seller_id",
        label: "Seller documents",
        endpoint: "/api/admin/upload-documents",
        filesField: "files",
        extraFields: { docType: "seller_id" },
      },
      {
        field: "document_rc",
        label: "RC documents",
        endpoint: "/api/admin/upload-documents",
        filesField: "files",
        extraFields: { docType: "rc" },
      },
      {
        field: "document_insurance",
        label: "Insurance documents",
        endpoint: "/api/admin/upload-documents",
        filesField: "files",
        extraFields: { docType: "insurance" },
      },
      {
        field: "document_other",
        label: "Other papers",
        endpoint: "/api/admin/upload-documents",
        filesField: "files",
        extraFields: { docType: "other" },
      },
      {
        field: "document_buyer_id",
        label: "Buyer documents",
        endpoint: "/api/admin/upload-documents",
        filesField: "files",
        extraFields: { docType: "buyer_id" },
      },
      {
        field: "images",
        label: "Car photos",
        endpoint: "/api/admin/upload-listing-images",
        filesField: "images",
        extraFields: {} as Record<string, string>,
      },
    ] as const;

    async function uploadSingleFile(
      endpoint: string,
      payload: FormData,
      label: string,
      fileName: string,
    ) {
      let response: Response | null = null;
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            body: payload,
          });
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!response) {
        const networkMessage =
          lastError instanceof Error ? lastError.message : "Network request failed.";
        throw new Error(`${label} upload failed for ${fileName}: ${networkMessage}`);
      }

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          response.status === 413
            ? `${label} upload failed for ${fileName}. File is too large for mobile upload.`
            : `${label} upload failed for ${fileName}. The server returned an unexpected response.`,
        );
      }

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || `${label} upload failed for ${fileName}.`);
      }
    }

    const failedUploads: string[] = [];

    for (const plan of uploadPlans) {
      const files = selectedFiles[plan.field] ?? [];

      if (!files.length) {
        continue;
      }

      for (const file of files) {
        let preparedFile = file;

        try {
          preparedFile =
            plan.field === "images"
              ? await normalizeCarPhotoUpload(file)
              : await normalizeDocumentUpload(file);
        } catch (error) {
          const message =
            error instanceof Error
              ? `${plan.label} upload failed for ${file.name}. ${error.message}`
              : `${plan.label} upload failed for ${file.name}.`;
          failedUploads.push(message);
          console.error("Create File preprocessing failed", {
            listingId,
            label: plan.label,
            fileName: file.name,
            message,
          });
          continue;
        }

        const maxBytes = plan.field === "images" ? PHOTO_MAX_BYTES : DOCUMENT_MAX_BYTES;

        if (preparedFile.size > maxBytes) {
          const message = `${plan.label} upload failed for ${file.name}. File is too large after processing.`;
          failedUploads.push(message);
          console.error("Create File upload skipped for oversize file", {
            listingId,
            label: plan.label,
            fileName: file.name,
            originalSize: file.size,
            preparedSize: preparedFile.size,
          });
          continue;
        }

        const uploadPayload = new FormData();
        uploadPayload.append("listingId", listingId);

        Object.entries(plan.extraFields).forEach(([key, value]) => {
          uploadPayload.append(key, value);
        });

        uploadPayload.append(plan.filesField, preparedFile);
        try {
          await uploadSingleFile(plan.endpoint, uploadPayload, plan.label, file.name);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : `${plan.label} upload failed for ${file.name}.`;
          failedUploads.push(message);
          console.error("Create File follow-up upload failed", {
            listingId,
            label: plan.label,
            fileName: file.name,
            message,
          });
        }
      }
    }

    return failedUploads;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formRef.current || isPending) {
      return;
    }

    setLocalMessage("");
    setState({ status: "idle" });
    setIsPending(true);
    let createdListingId = "";

    try {
      const payload = new FormData(formRef.current);
      for (const fieldName of uploadFieldNames) {
        payload.delete(fieldName);
      }

      const response = await fetch("/api/admin/create-file", {
        method: "POST",
        body: payload,
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("An unexpected response was received from the server.");
      }

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        redirectTo?: string;
        listingId?: string;
      };

      if (!response.ok || !result.success) {
        setState({
          status: "error",
          message: result.message || "Could not create file. Please try again.",
        });
        return;
      }

      const listingId = typeof result.listingId === "string" ? result.listingId : "";
      createdListingId = listingId;

      if (!listingId) {
        throw new Error("File was created, but the saved file id is missing.");
      }

      const failedUploads = await uploadFilesForListing(listingId);

      if (failedUploads.length) {
        throw new Error(
          `${failedUploads[0]}${failedUploads.length > 1 ? ` ${failedUploads.length - 1} more upload issue(s) also happened.` : ""}`,
        );
      }

      setState({
        status: "success",
        message: result.message || "Car saved successfully.",
        redirectTo: result.redirectTo || "/admin",
        listingId,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create file. Please try again.";

      setState({
        status: "error",
        message:
          createdListingId && error instanceof Error
            ? `${message} The file was created. Open it to finish the remaining uploads.`
            : message,
        listingId: createdListingId || undefined,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <input type="hidden" name="listingId" value={listing?.id ?? ""} />
      <input type="hidden" name="status" value={defaultStatus} />
      <input type="hidden" name="sellerType" value={listing?.sellerType ?? "dealer"} />
      <input type="hidden" name="coverImageUrl" value={listing?.coverImageUrl ?? ""} />

      <div className="flex flex-wrap items-center gap-2">
        {stepOrder.map((stepKey) => (
          <StepPill key={stepKey} step={stepKey} activeStep={step} onClick={goToStep} />
        ))}
      </div>

      {localMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {localMessage}
        </div>
      ) : null}

      {state.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            state.status === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
          {state.status === "error" && state.listingId ? (
            <button
              type="button"
              className="mt-3 inline-flex rounded-xl border border-current px-3 py-2 text-sm font-semibold"
              onClick={() => router.push(`/admin/files/${state.listingId}`)}
            >
              Open saved file
            </button>
          ) : null}
        </div>
      ) : null}

      <section className={step === "seller" ? "grid gap-4" : "hidden"} aria-hidden={step !== "seller"}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Seller</p>
            <h2 className="mt-1 text-2xl font-semibold text-black">Add seller details</h2>
            <p className="mt-1 text-sm text-gray-600">Start with the seller name, phone, and papers.</p>
          </div>

          <div className="grid gap-4">
            <label>
              <FieldLabel>Seller Name</FieldLabel>
              <input
                className="admin-field h-12"
                name="sellerName"
                defaultValue={listing?.seller?.name ?? ""}
                placeholder="Seller name"
              />
            </label>
            <label>
              <FieldLabel>Phone</FieldLabel>
              <input
                className="admin-field h-12"
                name="sellerPhone"
                defaultValue={listing?.seller?.phone ?? ""}
                placeholder="Phone number"
              />
            </label>
            <label>
              <FieldLabel>Address</FieldLabel>
              <input
                className="admin-field h-12"
                name="sellerAddress"
                defaultValue={listing?.seller?.address ?? ""}
                placeholder="Optional address"
              />
            </label>
            <label>
              <FieldLabel>Notes</FieldLabel>
              <textarea
                className="admin-field min-h-[96px]"
                name="sellerNotes"
                defaultValue={listing?.seller?.notes ?? ""}
                placeholder="Optional notes"
              />
            </label>
            <UploadCard
              label="Upload Seller Docs"
              helper="Pick one or more seller papers now."
              name="document_seller_id"
              accept={documentAccept}
              multiple
              files={selectedFiles.document_seller_id}
              onFilesChange={updateSelectedFiles}
              onRemoveFile={removeSelectedFile}
            />
          </div>

          <button type="button" onClick={continueFromSeller} className="admin-btn h-12 justify-center text-sm">
            Save Seller & Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>

      <section className={step === "car" ? "grid gap-4" : "hidden"} aria-hidden={step !== "car"}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Car</p>
            <h2 className="mt-1 text-2xl font-semibold text-black">Add car details</h2>
            <p className="mt-1 text-sm text-gray-600">Add the car name, number plate, photos, and main papers. Buyer details can be added later when the car is sold.</p>
          </div>

          <div className="grid gap-4">
            <label>
              <FieldLabel>Car Name / Make</FieldLabel>
              <input className="admin-field h-12" name="make" defaultValue={listing?.make ?? ""} placeholder="Hyundai, BMW, Isuzu..." />
            </label>
            <label>
              <FieldLabel>Model</FieldLabel>
              <input className="admin-field h-12" name="model" defaultValue={listing?.model ?? ""} placeholder="Creta, X5, D-Max..." />
            </label>
            <label>
              <FieldLabel>Number Plate</FieldLabel>
              <input className="admin-field h-12" name="numberPlate" defaultValue={listing?.numberPlate ?? ""} placeholder="PB10AB1234" />
            </label>
            <label>
              <FieldLabel>Price</FieldLabel>
              <input className="admin-field h-12" type="number" name="price" defaultValue={listing?.price ?? ""} placeholder="Price" />
            </label>
            <label>
              <FieldLabel>Year</FieldLabel>
              <input className="admin-field h-12" type="number" name="year" defaultValue={listing?.year ?? ""} placeholder="Year" />
            </label>
            <label>
              <FieldLabel>Fuel</FieldLabel>
              <input className="admin-field h-12" name="fuel" defaultValue={listing?.fuel ?? ""} placeholder="Petrol, diesel..." />
            </label>
            <label>
              <FieldLabel>Gear</FieldLabel>
              <input className="admin-field h-12" name="transmission" defaultValue={listing?.transmission ?? ""} placeholder="Manual or automatic" />
            </label>

            <details className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-black">Optional details</summary>
              <div className="mt-4 grid gap-4">
                <label>
                  <FieldLabel>Model Type</FieldLabel>
                  <input className="admin-field h-12" name="variant" defaultValue={listing?.variant ?? ""} placeholder="Optional model type" />
                </label>
                <label>
                  <FieldLabel>KM</FieldLabel>
                  <input className="admin-field h-12" type="number" name="kmDriven" defaultValue={listing?.kmDriven ?? ""} placeholder="KM driven" />
                </label>
                <label>
                  <FieldLabel>Owner Count</FieldLabel>
                  <input className="admin-field h-12" type="number" name="ownerCount" defaultValue={listing?.ownerCount ?? ""} placeholder="Owner count" />
                </label>
                <label>
                  <FieldLabel>Color</FieldLabel>
                  <input className="admin-field h-12" name="color" defaultValue={listing?.color ?? ""} placeholder="Optional color" />
                </label>
                <label>
                  <FieldLabel>Location</FieldLabel>
                  <input className="admin-field h-12" name="location" defaultValue={listing?.location ?? ""} placeholder="Location" />
                </label>
                <label>
                  <FieldLabel>Notes</FieldLabel>
                  <textarea className="admin-field min-h-[96px]" name="description" defaultValue={listing?.description ?? ""} placeholder="Optional notes" />
                </label>
                {isEditing ? (
                  <label>
                    <FieldLabel>Status</FieldLabel>
                    <select className="admin-field h-12" name="status" defaultValue={defaultStatus}>
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="sold">Sold</option>
                    </select>
                  </label>
                ) : null}
                <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800">
                  <input type="checkbox" name="featured" defaultChecked={listing?.featured ?? false} />
                  Show in featured cars
                </label>
              </div>
            </details>

            <UploadCard
              label="Upload Car Photos"
              helper="Pick one or more car photos."
              name="images"
              accept={photoAccept}
              multiple
              files={selectedFiles.images}
              onFilesChange={updateSelectedFiles}
              onRemoveFile={removeSelectedFile}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {carDocumentFields.map((field) => (
                <UploadCard
                  key={field.name}
                  label={`Upload ${field.label}`}
                  helper={`Add one or more ${field.label.toLowerCase()} papers`}
                  name={field.name}
                  accept={field.accept}
                  multiple
                  files={selectedFiles[field.name]}
                  onFilesChange={updateSelectedFiles}
                  onRemoveFile={removeSelectedFile}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => goToStep("seller")} className="admin-btn h-12 justify-center text-sm">
              Back
            </button>
            <button type="submit" className="admin-btn h-12 justify-center text-sm" disabled={isPending}>
              {isPending ? "Saving File..." : isEditing ? "Save File" : "Create File"}
            </button>
            <button type="button" onClick={continueFromCar} className="admin-btn h-12 justify-center text-sm" disabled={isPending}>
              Add Buyer Details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

      <section className={step === "buyer" ? "grid gap-4" : "hidden"} aria-hidden={step !== "buyer"}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Buyer</p>
            <h2 className="mt-1 text-2xl font-semibold text-black">Add buyer details</h2>
            <p className="mt-1 text-sm text-gray-600">Add buyer details only when the car is sold.</p>
          </div>

          <div className="grid gap-4">
            <label>
              <FieldLabel>Buyer Name</FieldLabel>
              <input className="admin-field h-12" name="buyerName" defaultValue={listing?.buyer?.name ?? ""} placeholder="Buyer name" />
            </label>
            <label>
              <FieldLabel>Phone</FieldLabel>
              <input className="admin-field h-12" name="buyerPhone" defaultValue={listing?.buyer?.phone ?? ""} placeholder="Phone number" />
            </label>
            <label>
              <FieldLabel>Address</FieldLabel>
              <input
                className="admin-field h-12"
                name="buyerAddress"
                defaultValue={buyerDraft.address}
                placeholder="Optional address"
              />
            </label>
            <label>
              <FieldLabel>Sold Price</FieldLabel>
              <input className="admin-field h-12" type="number" name="soldPrice" defaultValue={listing?.buyer?.soldPrice ?? ""} placeholder="Optional sold price" />
            </label>
            <label>
              <FieldLabel>Sale Date</FieldLabel>
              <input className="admin-field h-12" type="date" name="saleDate" defaultValue={listing?.buyer?.saleDate ?? ""} />
            </label>
            <label>
              <FieldLabel>Notes</FieldLabel>
              <textarea
                className="admin-field min-h-[96px]"
                name="buyerNotes"
                defaultValue={buyerDraft.notes}
                placeholder="Optional notes"
              />
            </label>

            <UploadCard
              label="Upload Buyer Docs"
              helper="Pick one or more buyer papers now."
              name="document_buyer_id"
              accept={documentAccept}
              multiple
              files={selectedFiles.document_buyer_id}
              onFilesChange={updateSelectedFiles}
              onRemoveFile={removeSelectedFile}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => goToStep("car")} className="admin-btn h-12 justify-center text-sm" disabled={isPending}>
              Back
            </button>
            <button type="submit" className="admin-btn h-12 justify-center text-sm" disabled={isPending}>
              {isPending ? "Saving File..." : isEditing ? "Save Buyer & File" : "Create File With Buyer"}
            </button>
          </div>
        </section>
    </form>
  );
}
