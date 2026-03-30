import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function ensureStorageBucket(bucket: string) {
  const supabase = createSupabaseAdminClient();
  const shouldBePublic = bucket === "documents";

  if (!supabase) {
    return {
      ok: false,
      error: "Upload client is not ready.",
    };
  }

  const { data: existingBucket } = await supabase.storage.getBucket(bucket);

  if (existingBucket) {
    if (shouldBePublic && !existingBucket.public) {
      const { error: updateError } = await supabase.storage.updateBucket(bucket, {
        public: true,
      });

      if (updateError) {
        return {
          ok: false,
          error: updateError.message,
        };
      }
    }

    return {
      ok: true,
      error: null,
    };
  }

  const { error } = await supabase.storage.createBucket(bucket, {
    public: shouldBePublic,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: true,
    error: null,
  };
}

async function uploadFileWithResult(bucket: string, path: string, file: File) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !file.size) {
    return {
      publicUrl: null,
      error: "Upload client is not ready.",
    };
  }

  const bucketReady = await ensureStorageBucket(bucket);

  if (!bucketReady.ok) {
    return {
      publicUrl: null,
      error: bucketReady.error || "Bucket setup failed.",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
    contentType: file.type || undefined,
    upsert: true,
  });

  if (error) {
    return {
      publicUrl: null,
      error: error.message,
    };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    error: null,
  };
}

async function revalidatePaths(listingId: string) {
  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/admin");
  revalidatePath("/admin/files");
  revalidatePath("/admin/files/new");
  revalidatePath("/admin/completed-files");
  revalidatePath(`/admin/files/${listingId}`);
  revalidatePath(`/admin/files/${listingId}/edit`);
}

function getFolderName(docType: string) {
  if (docType === "seller_id") {
    return "seller-docs";
  }

  if (docType === "buyer_id") {
    return "buyer-docs";
  }

  return "car-docs";
}

export async function POST(request: Request) {
  try {
    const serverSupabase = await createServerSupabaseClient();

    if (!serverSupabase) {
      return NextResponse.json(
        { success: false, message: "Supabase server connection is missing." },
        { status: 500 },
      );
    }

    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in again." },
        { status: 401 },
      );
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { success: false, message: "Supabase admin connection is missing." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const listingId = String(formData.get("listingId") || "");
    const docType = String(formData.get("docType") || "");
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!listingId) {
      return NextResponse.json(
        { success: false, message: "Car file was not found." },
        { status: 400 },
      );
    }

    if (!docType) {
      return NextResponse.json(
        { success: false, message: "Document type is missing." },
        { status: 400 },
      );
    }

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: "Please choose at least one file." },
        { status: 400 },
      );
    }

    const uploadedDocuments: Array<{
      id: string;
      listingId: string;
      docType: string;
      fileUrl: string;
      notes: string | null;
    }> = [];
    let uploadedCount = 0;

    for (const file of files) {
      const extension = file.name.split(".").pop() || "pdf";
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const folder = getFolderName(docType);
      const finalName = safeName.includes(".") ? safeName : `${safeName}.${extension}`;
      const path = `${folder}/${listingId}/${Date.now()}-${randomUUID()}-${finalName}`;
      const uploadResult = await uploadFileWithResult("documents", path, file);

      if (!uploadResult.publicUrl) {
        return NextResponse.json(
          {
            success: false,
            message: `${docType} upload failed: ${file.name}`,
          },
          { status: 500 },
        );
      }

      const notes = JSON.stringify({
        originalName: file.name,
        mimeType: file.type || null,
      });

      const { data: insertedDocument, error: documentError } = await supabase
        .from("documents")
        .insert({
          listing_id: listingId,
          doc_type: docType,
          file_url: uploadResult.publicUrl,
          notes,
        })
        .select("id,file_url,notes,doc_type")
        .single();

      if (documentError || !insertedDocument) {
        return NextResponse.json(
          {
            success: false,
            message: `${docType} save failed: ${documentError?.message || "Unknown error"}`,
          },
          { status: 500 },
        );
      }

      uploadedCount += 1;
      uploadedDocuments.push({
        id: insertedDocument.id,
        listingId,
        docType: insertedDocument.doc_type,
        fileUrl: insertedDocument.file_url,
        notes: insertedDocument.notes,
      });
    }

    await revalidatePaths(listingId);

    return NextResponse.json({
      success: true,
      message: `${uploadedCount} file${uploadedCount > 1 ? "s" : ""} uploaded successfully.`,
      documents: uploadedDocuments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Document upload failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
