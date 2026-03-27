import Link from "next/link";
import { ArrowRight, CircleCheckBig, FolderClock, FolderOpenDot, UserRoundSearch } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { RecentFilesTable } from "@/components/admin/recent-files-table";
import { getDashboardSummary } from "@/lib/data";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <AdminShell>
      <div className="grid gap-4 xl:grid-cols-5">
        <StatCard label="Total Files" value={summary.totalFiles} hint="All car files" accent="blue" />
        <StatCard label="Cars In Stock" value={summary.carsInStock} hint="Cars ready for sale" accent="green" />
        <StatCard label="Sold Cars" value={summary.soldCars} hint="Cars already sold" accent="orange" />
        <StatCard label="Missing Buyer Docs" value={summary.filesMissingBuyerDocuments} hint="Files waiting for buyer papers" accent="sky" />
        <StatCard label="Missing Seller Docs" value={summary.filesMissingSellerDocuments} hint="Files waiting for seller papers" accent="amber" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a2e]">
                Recently Updated Files
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Open the car files you changed last
              </h2>
            </div>
            <Link href="/admin/files" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <RecentFilesTable files={summary.recentFiles} />
        </section>

        <div className="grid gap-5">
          <section className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FolderClock className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-semibold text-slate-900">How one car file works</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                ["Seller", "Start with seller name, phone, and seller papers."],
                ["Car", "Add the car details, number plate, price, and photos."],
                ["Buyer", "When sold, add buyer details and buyer papers."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[22px] border border-sky-100 bg-sky-50/50 p-4">
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <UserRoundSearch className="h-5 w-5 text-[#ff8a2e]" />
              <h2 className="text-lg font-semibold text-slate-900">What needs attention</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <FocusItem
                icon={<CircleCheckBig className="h-4 w-4 text-emerald-600" />}
                title="Finish sold car files first"
                text="If a car is sold, add the buyer details and papers quickly."
              />
              <FocusItem
                icon={<FolderOpenDot className="h-4 w-4 text-sky-600" />}
                title="Search by number plate"
                text="You can also search by file number, seller name, buyer name, or phone."
              />
              <FocusItem
                icon={<FolderClock className="h-4 w-4 text-amber-600" />}
                title="Keep one file for each car"
                text="Seller, car, buyer, and documents stay together in one simple file."
              />
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent: "blue" | "green" | "orange" | "sky" | "amber";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
  } as const;

  return (
    <article className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tones[accent]}`}>
        {label}
      </span>
      <p className="mt-4 text-4xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  );
}

function FocusItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-sky-100 bg-sky-50/50 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}
