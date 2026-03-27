import { AdminShell } from "@/components/admin/admin-shell";
import { getInquiries } from "@/lib/data";

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <AdminShell>
      <div className="grid gap-5">
        <section className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
            Website Inquiries
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Track buyer interest linked to each digital car file
          </h1>
        </section>
        {inquiries.map((inquiry) => (
          <article key={inquiry.id} className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-slate-900">
                  {inquiry.name}
                </h2>
                <p className="mt-1 text-slate-500">
                  {inquiry.listingId ? `Listing ${inquiry.listingId}` : "General inquiry"}
                </p>
              </div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#ff8a2e]">
                {new Date(inquiry.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-5 grid gap-2 text-slate-600">
              <p>Phone: {inquiry.phone}</p>
              {inquiry.email ? <p>Email: {inquiry.email}</p> : null}
              {inquiry.message ? <p>Message: {inquiry.message}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
