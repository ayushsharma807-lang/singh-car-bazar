import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const allowedBuckets = new Set(["listing-photos", "documents"]);

function getMimeTypeFromPath(path: string) {
  const lowerPath = path.toLowerCase();

  if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (lowerPath.endsWith(".png")) {
    return "image/png";
  }

  if (lowerPath.endsWith(".webp")) {
    return "image/webp";
  }

  if (lowerPath.endsWith(".heic")) {
    return "image/heic";
  }

  if (lowerPath.endsWith(".heif")) {
    return "image/heif";
  }

  if (lowerPath.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (lowerPath.endsWith(".doc")) {
    return "application/msword";
  }

  if (lowerPath.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return "application/octet-stream";
}

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
      "Content-Type": data.type || getMimeTypeFromPath(path),
      "Content-Disposition": `inline; filename="${encodeURIComponent(path.split("/").pop() || "file")}"`,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
