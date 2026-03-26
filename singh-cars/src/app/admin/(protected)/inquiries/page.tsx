import { AdminShell } from "@/components/admin/admin-shell";
import { getInquiries } from "@/lib/data";

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <AdminShell title="Website Inquiries">
      <div className="grid gap-5">
        {inquiries.map((inquiry) => (
          <article key={inquiry.id} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">
                  {inquiry.name}
                </h2>
                <p className="mt-1 text-slate-400">{inquiry.carTitle ?? "General inquiry"}</p>
              </div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#ff8a2e]">
                {new Date(inquiry.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-5 grid gap-2 text-slate-300">
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
