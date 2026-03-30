import { AdminShell } from "@/components/admin/admin-shell";
import { ListingForm } from "@/components/admin/listing-form";

export default function NewFilePage() {
  return (
    <AdminShell>
      <section className="grid gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
            New File
          </p>
          <h1 className="mt-1 text-xl font-semibold text-black sm:text-2xl">
            Add seller, car, and buyer papers
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill one step at a time. The app moves you forward after each step.
          </p>
        </div>
        <ListingForm />
      </section>
    </AdminShell>
  );
}
