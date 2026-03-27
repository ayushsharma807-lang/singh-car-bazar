import { submitInquiryAction } from "@/app/admin/actions";

type InquiryFormProps = {
  listingId?: string;
  title?: string;
  submitLabel?: string;
  className?: string;
};

export function InquiryForm({
  listingId,
  title,
  submitLabel = "Submit Inquiry",
  className = "",
}: InquiryFormProps) {
  return (
    <form
      action={submitInquiryAction}
      className={`grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <input type="hidden" name="listingId" value={listingId ?? ""} />
      {title ? (
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2252e8]">
          {title}
        </p>
      ) : null}
      <input className="field" name="name" placeholder="Your Name" required />
      <input className="field" name="phone" placeholder="Phone Number" required />
      <input className="field" type="email" name="email" placeholder="Email Address" />
      <textarea className="field min-h-[140px]" name="message" placeholder="Write your inquiry" />
      <button
        type="submit"
        className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
