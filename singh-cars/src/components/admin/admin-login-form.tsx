"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setError("Set Supabase environment variables before using admin login.");
      return;
    }

    setIsPending(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (signInError) {
      setError(signInError.message);
      setIsPending(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      action={handleSubmit}
      className="mx-auto grid max-w-md gap-4 rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)]"
    >
      <h1 className="font-display text-4xl uppercase tracking-[0.08em] text-slate-900">
        Admin Login
      </h1>
      <input className="field" type="email" name="email" placeholder="Admin email" required />
      <input className="field" type="password" name="password" placeholder="Password" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[#2252e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-70"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
