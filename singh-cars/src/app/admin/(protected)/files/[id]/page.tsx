import Link from "next/link";
import { notFound } from "next/navigation";
import { markListingSoldAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { FileWorkspace } from "@/components/admin/file-workspace";
import { buildAdminCarName, getAdminFileById } from "@/lib/data";

type AdminFileDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

const saveMessages: Record<string, string> = {
  seller: "Seller details saved.",
  car: "Car details saved.",
  buyer: "Buyer details saved.",
  status: "Car status updated.",
};

export default async function AdminFileDetailPage({
  params,
  searchParams,
}: AdminFileDetailPageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const file = await getAdminFileById(id);

  if (!file) {
    notFound();
  }

  const topStatus =
    file.status === "sold"
      ? "Sold"
      : file.publicListingStatus.ready
        ? "Ready"
        : "In Progress";
  const nextStep =
    !file.listing.seller?.name?.trim() || !file.listing.seller?.phone?.trim()
      ? "seller"
      : !file.listing.make.trim() || !file.listing.model.trim() || !file.listing.numberPlate.trim()
        ? "car"
        : file.status === "sold" && (!file.listing.buyer?.name?.trim() || !file.listing.buyer?.phone?.trim())
          ? "buyer"
          : null;
  const nextStepText =
    nextStep === "seller"
      ? "Next: add seller details."
      : nextStep === "car"
        ? "Next: add car details."
        : nextStep === "buyer"
          ? "Next: add buyer details."
          : file.isCompletedFile
            ? "This file is ready to move to Completed Files."
            : "Keep adding papers and photos to finish this file.";
  const whatsappSummary = [
    "Singh Car Bazar",
    `File No: ${file.fileNumber}`,
    `Car: ${buildAdminCarName(file.listing)}`,
    file.numberPlate ? `Number Plate: ${file.numberPlate}` : "",
    file.sellerName ? `Seller: ${file.sellerName}` : "",
    file.buyerName ? `Buyer: ${file.buyerName}` : "",
    `Status: ${topStatus}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <AdminShell>
      <div className="grid gap-5">
        {saved && saveMessages[saved] ? (
          <section className="rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-sm font-semibold text-green-800 shadow-sm">
            {saveMessages[saved]}
          </section>
        ) : null}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                File {file.fileNumber}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-xl border px-3 py-1 text-xs font-semibold ${
                    topStatus === "Sold"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : topStatus === "Ready"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {topStatus}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{nextStepText}</p>
            </div>
            {file.isCompletedFile ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`https://wa.me/?text=${encodeURIComponent(whatsappSummary)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn h-12 px-5 text-base"
                >
                  Share Car Info
                </Link>
                <Link
                  href={`/admin/completed-files?completed=1&file=${file.id}`}
                  className="admin-btn h-12 px-5 text-base"
                >
                  Mark as Complete
                </Link>
              </div>
            ) : file.status === "sold" && nextStep ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`https://wa.me/?text=${encodeURIComponent(whatsappSummary)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn h-12 px-5 text-base"
                >
                  Share Car Info
                </Link>
                <Link
                  href={`/admin/files/${file.id}#${nextStep}-step`}
                  className="admin-btn h-12 px-5 text-base"
                >
                  Add Missing Info
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`https://wa.me/?text=${encodeURIComponent(whatsappSummary)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn h-12 px-5 text-base"
                >
                  Share Car Info
                </Link>
                <form action={markListingSoldAction}>
                  <input type="hidden" name="listingId" value={file.id} />
                  <button
                    type="submit"
                    className="admin-btn h-12 px-5 text-base"
                    disabled={file.status === "sold"}
                  >
                    {file.status === "sold" ? "Sold" : "Mark as Sold"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        <FileWorkspace file={file} savedStep={saved} />
      </div>
    </AdminShell>
  );
}
