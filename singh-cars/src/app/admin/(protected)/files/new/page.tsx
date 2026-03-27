import { AdminShell } from "@/components/admin/admin-shell";
import { ListingForm } from "@/components/admin/listing-form";

export default function NewFilePage() {
  return (
    <AdminShell>
      <section className="grid gap-5">
        <div className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
            New Car File
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Create one digital file covering seller, car, and buyer workflow
          </h1>
        </div>
        <ListingForm />
      </section>
    </AdminShell>
  );
}
