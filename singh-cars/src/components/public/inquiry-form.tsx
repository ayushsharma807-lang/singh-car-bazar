"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitInquiryAction, type InquiryActionState } from "@/app/admin/actions";

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
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: InquiryActionState = { status: "idle" };
  const [state, formAction, isPending] = useActionState(submitInquiryAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
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
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-green-700"}`}>
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#173bb0] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}
