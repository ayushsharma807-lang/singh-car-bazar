import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ListingForm } from "@/components/admin/listing-form";
import { getAdminFileById } from "@/lib/data";

type EditAdminFilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminFilePage({
  params,
}: EditAdminFilePageProps) {
  const { id } = await params;
  const file = await getAdminFileById(id);

  if (!file) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="grid gap-5">
        <section className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
            Edit Car
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {file.fileNumber} · {file.carName}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Update the seller, car, buyer, or documents without leaving this file.
          </p>
        </section>
        <ListingForm listing={file.listing} />
      </div>
    </AdminShell>
  );
}
