"use client";

import type { ReactNode } from "react";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CarFront,
  Check,
  ChevronDown,
  CircleUserRound,
  FileText,
  IndianRupee,
  Star,
} from "lucide-react";
import type { AdminFileRecord, ListingDocument, ListingImage } from "@/types";
import {
  removeDocumentByIdAction,
  removeListingImageByIdAction,
  setListingCoverImageAction,
  uploadDocumentInlineAction,
  uploadListingImagesInlineAction,
  updateBuyerInfoAction,
  updateCarInfoAction,
  updateSellerInfoAction,
} from "@/app/admin/actions";

type FileStep = "seller" | "car" | "buyer";

type UploadResult = {
  success: boolean;
  message: string;
  fileName?: string;
  fileUrl?: string;
  docType?: string;
  notes?: string;
  documentId?: string;
  images?: ListingImage[];
};

type RemoveResult = {
  success: boolean;
  message: string;
  documentId?: string;
  imageId?: string;
  imageUrl?: string;
};

type SellerDraft = {
  name: string;
  phone: string;
};

type CarDraft = {
  numberPlate: string;
  make: string;
  model: string;
  year: string;
  kmDriven: string;
  fuel: string;
  transmission: string;
  price: string;
  status: string;
};

type BuyerDraft = {
  name: string;
  phone: string;
  soldPrice: string;
};

const carDocumentGroups = [
  { label: "RC", docType: "rc", emptyText: "No RC uploaded yet" },
  { label: "Insurance", docType: "insurance", emptyText: "No insurance uploaded yet" },
  { label: "Other papers", docType: "other", emptyText: "No other papers uploaded yet" },
] as const;

function getFileName(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "file");
  } catch {
    return "file";
  }
}

function formatPrice(value?: number | string | null) {
  const numericValue =
    typeof value === "string" ? Number(value || 0) : Number(value || 0);

  if (!numericValue) {
    return "Price not added";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
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

function getDocumentsByType(documents: ListingDocument[], docType: string) {
  return documents.filter((document) => document.docType === docType);
}

function getDocumentMeta(document: ListingDocument) {
  const fallbackName = getFileName(document.fileUrl)
    .replace(/^\d+-/, "")
    .replace(/^[^-]+-/, "");

  try {
    const parsed = document.notes ? JSON.parse(document.notes) : null;

    return {
      fileName: parsed?.originalName || fallbackName,
      mimeType: parsed?.mimeType || "",
    };
  } catch {
    return {
      fileName: fallbackName,
      mimeType: "",
    };
  }
}

function isImageName(name: string, mimeType = "") {
  const lowerName = name.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  return (
    lowerMime.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"].some((extension) =>
      lowerName.endsWith(extension),
    )
  );
}

function isImageDocument(document: ListingDocument) {
  const meta = getDocumentMeta(document);
  return isImageName(meta.fileName, meta.mimeType);
}

function UploadPicker({
  action,
  listingId,
  buttonLabel,
  inputName,
  accept,
  multiple = false,
  extraFields,
  onSuccess,
}: {
  action: (formData: FormData) => Promise<UploadResult>;
  listingId: string;
  buttonLabel: string;
  inputName: string;
  accept?: string;
  multiple?: boolean;
  extraFields?: { name: string; value: string }[];
  onSuccess?: (result: UploadResult) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({
    tone: "idle",
    message: "",
  });

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);

          if (!files.length) {
            return;
          }

          const uploadFormData = new FormData();
          uploadFormData.set("listingId", listingId);
          extraFields?.forEach((field) => {
            uploadFormData.set(field.name, field.value);
          });

          if (multiple) {
            for (const file of files) {
              uploadFormData.append(inputName, file);
            }
          } else {
            uploadFormData.set(inputName, files[0]);
          }

          setFeedback({
            tone: "idle",
            message:
              files.length > 1
                ? `Uploading ${files.length} files...`
                : `Uploading ${files[0]?.name || "file"}...`,
          });

          startTransition(async () => {
            try {
              const result = await action(uploadFormData);

              if (result.success) {
                setFeedback({
                  tone: "success",
                  message: result.message,
                });
                onSuccess?.(result);

                if (!onSuccess) {
                  window.setTimeout(() => {
                    router.refresh();
                  }, 700);
                }
              } else {
                setFeedback({
                  tone: "error",
                  message: result.message,
                });
              }
            } catch (error) {
              setFeedback({
                tone: "error",
                message:
                  error instanceof Error
                    ? error.message
                    : "Upload failed. Please try again.",
              });
            }
          });

          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        className="admin-btn h-12 px-4 text-sm"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? "Uploading..." : buttonLabel}
      </button>
      {feedback.message ? (
        <p
          className={`text-sm ${
            feedback.tone === "error"
              ? "text-red-600"
              : feedback.tone === "success"
                ? "text-green-700"
                : "text-gray-500"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
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

function FileCard({
  title,
  url,
  isImage,
  onRemove,
}: {
  title: string;
  url: string;
  isImage: boolean;
  onRemove: () => Promise<void> | void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isImage ? (
          <button
            type="button"
            className="block w-full"
            onClick={() => setPreviewOpen(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={title} className="h-28 w-full object-cover" />
          </button>
        ) : (
          <div className="flex h-28 items-center justify-center bg-gray-50 text-gray-500">
            <FileText className="h-8 w-8" />
          </div>
        )}
        <div className="grid gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black">{title}</p>
            <p className="mt-1 text-xs text-gray-500">{isImage ? "Image file" : "Document file"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={url} target="_blank" rel="noreferrer" className="admin-btn admin-btn-sm">
              Open
            </a>
            <button
              type="button"
              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isRemoving}
              onClick={() => setConfirmOpen(true)}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-black">Remove File?</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Are you sure you want to remove this document?
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="admin-btn h-11 px-4"
                disabled={isRemoving}
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRemoving}
                onClick={async () => {
                  setIsRemoving(true);
                  await onRemove();
                  setIsRemoving(false);
                  setConfirmOpen(false);
                }}
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen && isImage ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setPreviewOpen(false)}
            aria-label="Close preview"
          />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <p className="truncate text-sm font-semibold text-black">{title}</p>
              <button
                type="button"
                className="admin-btn admin-btn-sm"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={title} className="max-h-[80vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SellerDocCard({
  document,
  listingId,
  onRemove,
}: {
  document: ListingDocument;
  listingId: string;
  onRemove: (documentId: string) => void;
}) {
  const [, startTransition] = useTransition();
  const meta = getDocumentMeta(document);
  const image = isImageDocument(document);

  return (
    <FileCard
      title={meta.fileName}
      url={document.fileUrl}
      isImage={image}
      onRemove={() =>
        startTransition(async () => {
          const formData = new FormData();
          formData.set("listingId", listingId);
          formData.set("documentId", document.id);
          const result = (await removeDocumentByIdAction(formData)) as RemoveResult;

          if (result.success) {
            onRemove(document.id);
          }
        })
      }
    />
  );
}

function PhotoCard({
  image,
  listingId,
  isCover,
  onSetCover,
  onRemove,
}: {
  image: ListingImage;
  listingId: string;
  isCover: boolean;
  onSetCover: (imageId: string, imageUrl: string) => void;
  onRemove: (imageId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <button type="button" className="block w-full" onClick={() => setPreviewOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.imageUrl} alt="Car photo" className="h-28 w-full object-cover" />
        </button>
        <div className="grid gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-black">{getFileName(image.imageUrl)}</p>
              <p className="mt-1 text-xs text-gray-500">Car photo</p>
            </div>
            {isCover ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Star className="h-3.5 w-3.5 fill-current" />
                Cover
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={image.imageUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-sm">
              Open
            </a>
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              disabled={isPending || isCover}
              onClick={() =>
                startTransition(async () => {
                  const formData = new FormData();
                  formData.set("listingId", listingId);
                  formData.set("imageId", image.id);
                  const result = (await setListingCoverImageAction(formData)) as RemoveResult;

                  if (result.success) {
                    onSetCover(image.id, image.imageUrl);
                  }
                })
              }
            >
              {isCover ? "Main Cover" : "Set as Cover"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const formData = new FormData();
                  formData.set("listingId", listingId);
                  formData.set("imageId", image.id);
                  const result = (await removeListingImageByIdAction(formData)) as RemoveResult;

                  if (result.success) {
                    onRemove(image.id);
                  }
                })
              }
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      {previewOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setPreviewOpen(false)}
            aria-label="Close preview"
          />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <p className="truncate text-sm font-semibold text-black">{getFileName(image.imageUrl)}</p>
              <button
                type="button"
                className="admin-btn admin-btn-sm"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt="Car photo" className="max-h-[80vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function FileWorkspace({ file }: { file: AdminFileRecord }) {
  const buyerFields = useMemo(
    () => parseBuyerNotes(file.listing.buyer?.notes),
    [file.listing.buyer?.notes],
  );

  const [sellerDraft, setSellerDraft] = useState<SellerDraft>({
    name: file.listing.seller?.name ?? "",
    phone: file.listing.seller?.phone ?? "",
  });
  const [carDraft, setCarDraft] = useState<CarDraft>({
    numberPlate: file.listing.numberPlate ?? "",
    make: file.listing.make ?? "",
    model: file.listing.model ?? "",
    year: String(file.listing.year ?? ""),
    kmDriven: String(file.listing.kmDriven ?? ""),
    fuel: file.listing.fuel ?? "",
    transmission: file.listing.transmission ?? "",
    price: String(file.listing.price ?? ""),
    status: file.listing.status ?? "available",
  });
  const [buyerDraft, setBuyerDraft] = useState<BuyerDraft>({
    name: file.listing.buyer?.name ?? "",
    phone: file.listing.buyer?.phone ?? "",
    soldPrice: file.listing.buyer?.soldPrice ? String(file.listing.buyer.soldPrice) : "",
  });

  const [sellerDocs, setSellerDocs] = useState<ListingDocument[]>(
    getDocumentsByType(file.listing.documents, "seller_id"),
  );
  const [carDocs, setCarDocs] = useState<Record<string, ListingDocument[]>>({
    rc: getDocumentsByType(file.listing.documents, "rc"),
    insurance: getDocumentsByType(file.listing.documents, "insurance"),
    other: getDocumentsByType(file.listing.documents, "other"),
  });
  const [buyerDocs, setBuyerDocs] = useState<ListingDocument[]>(
    getDocumentsByType(file.listing.documents, "buyer_id"),
  );
  const [carPhotos, setCarPhotos] = useState<ListingImage[]>(file.listing.images);
  const [coverImageUrl, setCoverImageUrl] = useState(
    file.listing.coverImageUrl ?? file.listing.images[0]?.imageUrl ?? "",
  );

  const sellerDone = Boolean(sellerDraft.name.trim() && sellerDraft.phone.trim());
  const carDone = Boolean(
    carDraft.model.trim() && carDraft.numberPlate.trim() && Number(carDraft.price || 0),
  );
  const showBuyerStep = carDraft.status === "sold";
  const buyerDone = Boolean(
    buyerDraft.name.trim() && buyerDraft.phone.trim() && Number(buyerDraft.soldPrice || 0),
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
        emptyText={sellerDone ? "Seller details are ready." : "No seller added"}
        actionLabel={sellerDone ? "Edit Seller" : "+ Add Seller"}
        isOpen={activeStep === "seller"}
        onToggle={() => setActiveStep("seller")}
        summary={
          <>
            <SummaryLine label="Seller Name" value={sellerDraft.name.trim() || "No seller added"} />
            <SummaryLine label="Phone" value={sellerDraft.phone.trim() || "No seller added"} />
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
                value={sellerDraft.name}
                onChange={(event) =>
                  setSellerDraft((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Phone</span>
              <input
                className="admin-field h-12"
                name="sellerPhone"
                value={sellerDraft.phone}
                onChange={(event) =>
                  setSellerDraft((current) => ({ ...current, phone: event.target.value }))
                }
                required
              />
            </label>
          </div>
          <input type="hidden" name="sellerAddress" value={file.listing.seller?.address ?? ""} />
          <input type="hidden" name="sellerNotes" value={file.listing.seller?.notes ?? ""} />

          <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-black">Seller documents</p>
                <p className="text-sm text-gray-600">
                  {sellerDocs.length
                    ? `${sellerDocs.length} file${sellerDocs.length > 1 ? "s" : ""} uploaded`
                    : "No seller docs uploaded yet"}
                </p>
              </div>
              <UploadPicker
                action={uploadDocumentInlineAction}
                listingId={file.id}
                buttonLabel="Upload Seller Docs"
                inputName="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx"
                extraFields={[{ name: "docType", value: "seller_id" }]}
                onSuccess={(result) => {
                  if (result.success && result.documentId && result.fileUrl) {
                    setSellerDocs((current) => [
                      ...current,
                      {
                        id: result.documentId!,
                        listingId: file.id,
                        docType: result.docType || "seller_id",
                        fileUrl: result.fileUrl!,
                        notes: result.notes || null,
                      },
                    ]);
                  }
                }}
              />
            </div>

            {sellerDocs.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sellerDocs.map((document) => (
                  <SellerDocCard
                    key={document.id}
                    document={document}
                    listingId={file.id}
                    onRemove={(documentId) =>
                      setSellerDocs((current) => current.filter((entry) => entry.id !== documentId))
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-600">
                No seller docs uploaded yet
              </div>
            )}
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
            <SummaryLine label="Number Plate" value={carDraft.numberPlate.trim() || "No car details added"} />
            <SummaryLine label="Model" value={carDraft.model.trim() || "No car details added"} />
            <SummaryLine label="Price" value={formatPrice(carDraft.price)} />
            <SummaryLine
              label="Status"
              value={
                carDraft.status === "sold"
                  ? "Sold"
                  : carDraft.status === "booked"
                    ? "Booked"
                    : "Available"
              }
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
                value={carDraft.numberPlate}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, numberPlate: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Make</span>
              <input
                className="admin-field h-12"
                name="make"
                value={carDraft.make}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, make: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Model</span>
              <input
                className="admin-field h-12"
                name="model"
                value={carDraft.model}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, model: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Year</span>
              <input
                className="admin-field h-12"
                type="number"
                name="year"
                value={carDraft.year}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, year: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">KM</span>
              <input
                className="admin-field h-12"
                type="number"
                name="kmDriven"
                value={carDraft.kmDriven}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, kmDriven: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Fuel</span>
              <input
                className="admin-field h-12"
                name="fuel"
                value={carDraft.fuel}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, fuel: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Transmission</span>
              <input
                className="admin-field h-12"
                name="transmission"
                value={carDraft.transmission}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, transmission: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Price</span>
              <input
                className="admin-field h-12"
                type="number"
                name="price"
                value={carDraft.price}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, price: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-gray-800">Status</span>
              <select
                className="admin-field h-12"
                name="status"
                value={carDraft.status}
                onChange={(event) =>
                  setCarDraft((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="sold">Sold</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-black">Car documents</p>
                  <p className="text-sm text-gray-600">
                    {Object.values(carDocs).flat().length
                      ? `${Object.values(carDocs).flat().length} file${Object.values(carDocs).flat().length > 1 ? "s" : ""} uploaded`
                      : "No car docs uploaded yet"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {carDocumentGroups.map((group) => {
                  const documents = carDocs[group.docType] ?? [];

                  return (
                    <div key={group.docType} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-black">{group.label}</p>
                          <p className="text-sm text-gray-600">
                            {documents.length
                              ? `${documents.length} file${documents.length > 1 ? "s" : ""} uploaded`
                              : group.emptyText}
                          </p>
                        </div>
                        <UploadPicker
                          action={uploadDocumentInlineAction}
                          listingId={file.id}
                          buttonLabel={`Upload ${group.label}`}
                          inputName="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx"
                          extraFields={[{ name: "docType", value: group.docType }]}
                          onSuccess={(result) => {
                            if (result.success && result.documentId && result.fileUrl) {
                              setCarDocs((current) => ({
                                ...current,
                                [group.docType]: [
                                  ...(current[group.docType] ?? []),
                                  {
                                    id: result.documentId!,
                                    listingId: file.id,
                                    docType: result.docType || group.docType,
                                    fileUrl: result.fileUrl!,
                                    notes: result.notes || null,
                                  },
                                ],
                              }));
                            }
                          }}
                        />
                      </div>

                      {documents.length ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {documents.map((document) => (
                            <SellerDocCard
                              key={document.id}
                              document={document}
                              listingId={file.id}
                              onRemove={(documentId) =>
                                setCarDocs((current) => ({
                                  ...current,
                                  [group.docType]: (current[group.docType] ?? []).filter(
                                    (entry) => entry.id !== documentId,
                                  ),
                                }))
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                          {group.emptyText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-black">Car photos</p>
                  <p className="text-sm text-gray-600">
                    {carPhotos.length
                      ? `${carPhotos.length} photo${carPhotos.length > 1 ? "s" : ""} uploaded`
                      : "No car photos uploaded yet"}
                  </p>
                </div>
                <UploadPicker
                  action={uploadListingImagesInlineAction}
                  listingId={file.id}
                  buttonLabel="Upload Car Photos"
                  inputName="images"
                  accept=".jpg,.jpeg,.png,.webp,.heic"
                  multiple
                  onSuccess={(result) => {
                    if (result.success && result.images?.length) {
                      if (!coverImageUrl && result.images[0]?.imageUrl) {
                        setCoverImageUrl(result.images[0].imageUrl);
                      }
                      setCarPhotos((current) => [...current, ...result.images!]);
                    }
                  }}
                />
              </div>

              {carPhotos.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {carPhotos.map((image) => (
                    <PhotoCard
                      key={image.id}
                      image={image}
                      listingId={file.id}
                      isCover={coverImageUrl === image.imageUrl}
                      onSetCover={(_, imageUrl) => setCoverImageUrl(imageUrl)}
                      onRemove={(imageId) =>
                        setCarPhotos((current) => {
                          const next = current.filter((entry) => entry.id !== imageId);
                          const nextCover =
                            next.find((entry) => entry.imageUrl === coverImageUrl)?.imageUrl ??
                            next[0]?.imageUrl ??
                            "";
                          setCoverImageUrl(nextCover);
                          return next;
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-600">
                  No car photos uploaded yet
                </div>
              )}
            </div>
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
              <SummaryLine label="Buyer Name" value={buyerDraft.name.trim() || "No buyer added"} />
              <SummaryLine label="Phone" value={buyerDraft.phone.trim() || "No buyer added"} />
              <SummaryLine label="Sold Price" value={formatPrice(buyerDraft.soldPrice)} />
              <SummaryLine
                label="Docs"
                value={buyerDocs.length ? `${buyerDocs.length} files added` : "No buyer docs uploaded yet"}
              />
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
                  value={buyerDraft.name}
                  onChange={(event) =>
                    setBuyerDraft((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Phone</span>
                <input
                  className="admin-field h-12"
                  name="buyerPhone"
                  value={buyerDraft.phone}
                  onChange={(event) =>
                    setBuyerDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-800">Sold Price</span>
                <input
                  className="admin-field h-12"
                  type="number"
                  name="soldPrice"
                  value={buyerDraft.soldPrice}
                  onChange={(event) =>
                    setBuyerDraft((current) => ({ ...current, soldPrice: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-black">Buyer documents</p>
                  <p className="text-sm text-gray-600">
                    {buyerDocs.length
                      ? `${buyerDocs.length} file${buyerDocs.length > 1 ? "s" : ""} uploaded`
                      : "No buyer docs uploaded yet"}
                  </p>
                </div>
                <UploadPicker
                  action={uploadDocumentInlineAction}
                  listingId={file.id}
                  buttonLabel="Upload Buyer Docs"
                  inputName="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx"
                  extraFields={[{ name: "docType", value: "buyer_id" }]}
                  onSuccess={(result) => {
                    if (result.success && result.documentId && result.fileUrl) {
                      setBuyerDocs((current) => [
                        ...current,
                        {
                          id: result.documentId!,
                          listingId: file.id,
                          docType: result.docType || "buyer_id",
                          fileUrl: result.fileUrl!,
                          notes: result.notes || null,
                        },
                      ]);
                    }
                  }}
                />
              </div>

              {buyerDocs.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {buyerDocs.map((document) => (
                    <SellerDocCard
                      key={document.id}
                      document={document}
                      listingId={file.id}
                      onRemove={(documentId) =>
                        setBuyerDocs((current) => current.filter((entry) => entry.id !== documentId))
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-600">
                  No buyer docs uploaded yet
                </div>
              )}
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
