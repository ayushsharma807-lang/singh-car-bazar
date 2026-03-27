import { AdminShell } from "@/components/admin/admin-shell";
import { ListingForm } from "@/components/admin/listing-form";

export default function NewFilePage() {
  return (
    <AdminShell>
      <section className="grid gap-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Add Car
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-black">
            Add one simple car file in a few quick steps
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Start with seller details, add the car, then save. Extra details stay under “More details”.
          </p>
        </div>
        <ListingForm />
      </section>
    </AdminShell>
  );
}
