import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const allowedBuckets = new Set(["listing-photos", "documents"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket") || "";
  const path = searchParams.get("path") || "";

  if (!allowedBuckets.has(bucket) || !path) {
    return NextResponse.json(
      { success: false, message: "File request is missing details." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { success: false, message: "Supabase admin connection is missing." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: error?.message || "File not found." },
      { status: 404 },
    );
  }

  return new Response(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
