"use client";

import { useState } from "react";
import { CarFront, CircleUserRound, UserSquare2 } from "lucide-react";
import type { AdminFileRecord } from "@/types";

type Stage = "seller" | "car" | "buyer";

const stageMeta: Record<Stage, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  seller: { label: "Seller stage", icon: UserSquare2 },
  car: { label: "Car stage", icon: CarFront },
  buyer: { label: "Buyer stage", icon: CircleUserRound },
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid gap-1">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value || "Not added yet"}</p>
    </div>
  );
}

export function FileWorkspace({ file }: { file: AdminFileRecord }) {
  const [activeStage, setActiveStage] = useState<Stage>(file.stage);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(stageMeta) as Stage[]).map((stage) => {
          const Icon = stageMeta[stage].icon;
          const isActive = activeStage === stage;

          return (
            <button
              key={stage}
              type="button"
              onClick={() => setActiveStage(stage)}
              className={`flex items-center gap-3 rounded-[24px] border px-4 py-4 text-left shadow-sm transition ${
                isActive
                  ? "border-sky-200 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)]"
                  : "border-sky-100 bg-white hover:bg-sky-50/50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Section</p>
                <p className="text-sm font-semibold text-slate-900">{stageMeta[stage].label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {activeStage === "seller" ? (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Seller information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow label="Seller name" value={file.listing.seller?.name} />
              <InfoRow label="Phone number" value={file.listing.seller?.phone} />
              <InfoRow label="Seller type" value={file.listing.sellerType} />
              <InfoRow label="Status" value={file.listing.status} />
              <div className="sm:col-span-2">
                <InfoRow label="Address" value={file.listing.seller?.address} />
              </div>
              <div className="sm:col-span-2">
                <InfoRow label="Notes" value={file.listing.seller?.notes} />
              </div>
            </div>
          </div>
          <DocPanel
            title="Seller documents"
            ready={file.documentStatus.sellerReady}
            docTypes={["seller_id", "rc", "insurance"]}
            file={file}
          />
        </div>
      ) : null}

      {activeStage === "car" ? (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Car details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow label="File number" value={file.fileNumber} />
              <InfoRow label="Number plate" value={file.numberPlate} />
              <InfoRow label="Make / Model" value={file.carName} />
              <InfoRow label="Year" value={file.listing.year} />
              <InfoRow label="Fuel" value={file.listing.fuel} />
              <InfoRow label="Transmission" value={file.listing.transmission} />
              <InfoRow label="KM driven" value={file.listing.kmDriven} />
              <InfoRow label="Price" value={file.listing.price} />
              <InfoRow label="Color" value={file.listing.color} />
              <InfoRow label="Location" value={file.listing.location} />
              <div className="sm:col-span-2">
                <InfoRow label="Description" value={file.listing.description} />
              </div>
            </div>
          </div>
          <DocPanel
            title="Car documents and images"
            ready={file.documentStatus.carReady}
            docTypes={["rc", "insurance", "loan_noc", "other"]}
            file={file}
          />
        </div>
      ) : null}

      {activeStage === "buyer" ? (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Buyer information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow label="Buyer name" value={file.listing.buyer?.name} />
              <InfoRow label="Phone number" value={file.listing.buyer?.phone} />
              <InfoRow label="Sold price" value={file.listing.buyer?.soldPrice} />
              <InfoRow label="Sale date" value={file.listing.buyer?.saleDate} />
              <div className="sm:col-span-2">
                <InfoRow label="Notes" value={file.listing.buyer?.notes} />
              </div>
            </div>
          </div>
          <DocPanel
            title="Buyer documents"
            ready={file.documentStatus.buyerReady}
            docTypes={["buyer_id", "other"]}
            file={file}
          />
        </div>
      ) : null}
    </div>
  );
}

function DocPanel({
  title,
  ready,
  docTypes,
  file,
}: {
  title: string;
  ready: boolean;
  docTypes: string[];
  file: AdminFileRecord;
}) {
  const docs = file.listing.documents.filter((document) =>
    docTypes.includes(document.docType),
  );

  return (
    <div className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {ready ? "Ready" : "Needs update"}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {docs.length ? (
          docs.map((document) => (
            <a
              key={document.id}
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700 hover:bg-sky-100"
            >
              {document.docType}
            </a>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            No documents uploaded yet for this stage.
          </div>
        )}
      </div>
    </div>
  );
}
