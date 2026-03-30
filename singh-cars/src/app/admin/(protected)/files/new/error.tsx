"use client";

import Link from "next/link";

export default function NewFileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-800">
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">Create File</p>
        <h1 className="mt-2 text-xl font-semibold text-red-900">This page could not open</h1>
        <p className="mt-2 text-sm">
          {error.message || "Something went wrong while opening the new file form."}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="admin-btn h-12 justify-center text-sm">
          Try Again
        </button>
        <Link href="/admin" className="admin-btn h-12 justify-center text-sm">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
