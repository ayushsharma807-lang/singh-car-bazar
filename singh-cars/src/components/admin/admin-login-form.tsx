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
      className="mx-auto grid max-w-md gap-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
    >
      <h1 className="text-3xl font-semibold text-black">
        Admin Login
      </h1>
      <input className="field" type="email" name="email" placeholder="Admin email" required />
      <input className="field" type="password" name="password" placeholder="Password" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
