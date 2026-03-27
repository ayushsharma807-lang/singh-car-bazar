import { AdminShell } from "@/components/admin/admin-shell";

const workflowItems = [
  {
    title: "Seller",
    text: "Start with seller name, phone, and seller papers.",
  },
  {
    title: "Car",
    text: "Add the car details, number plate, price, and photos.",
  },
  {
    title: "Buyer",
    text: "When sold, add buyer details and buyer papers.",
  },
];

export default function AdminHelpPage() {
  return (
    <AdminShell>
      <div className="grid gap-5">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Help
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-black">
            Simple guide for using car files
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Use this page when staff need a quick reminder for the workflow.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">How one car file works</h2>
          <div className="mt-5 grid gap-3">
            {workflowItems.map((item) => (
              <article key={item.title} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="font-semibold text-black">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">What needs attention</h2>
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
            <p className="font-semibold text-black">Finish sold car files first</p>
            <p className="mt-1 text-sm text-gray-600">
              If a car is sold, add the buyer details and buyer papers quickly.
            </p>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
