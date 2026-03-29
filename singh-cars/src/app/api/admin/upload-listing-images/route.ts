import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function ensureStorageBucket(bucket: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Upload client is not ready.",
    };
  }

  const { data: existingBucket } = await supabase.storage.getBucket(bucket);

  if (existingBucket) {
    return {
      ok: true,
      error: null,
    };
  }

  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
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
    contentType: file.type || "image/jpeg",
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

async function revalidateAdminFilePaths(listingId: string) {
  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/admin");
  revalidatePath("/admin/files");
  revalidatePath("/admin/files/new");
  revalidatePath("/admin/completed-files");
  revalidatePath(`/admin/files/${listingId}`);
  revalidatePath(`/admin/files/${listingId}/edit`);
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
    const files = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!listingId) {
      return NextResponse.json(
        { success: false, message: "Car file was not found." },
        { status: 400 },
      );
    }

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: "Please choose at least one photo." },
        { status: 400 },
      );
    }

    const { data: existingImages } = await supabase
      .from("listing_images")
      .select("id,sort_order,image_url")
      .eq("listing_id", listingId)
      .order("sort_order", { ascending: true });

    let nextSortOrder = existingImages?.length ?? 0;

    const { data: listing } = await supabase
      .from("listings")
      .select("cover_image_url")
      .eq("id", listingId)
      .maybeSingle();

    let coverImageUrl = listing?.cover_image_url ?? null;
    let uploadedCount = 0;
    const uploadedImages: { id: string; listingId: string; imageUrl: string; sortOrder: number }[] = [];

    for (const file of files) {
      const hasImageMime = file.type.startsWith("image/");
      const hasImageExtension = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"].some(
        (extension) => file.name.toLowerCase().endsWith(extension),
      );

      if (!hasImageMime && !hasImageExtension) {
        continue;
      }

      const extension = file.name.split(".").pop() || "jpg";
      const path = `${listingId}/${Date.now()}-${randomUUID()}.${extension}`;
      const uploadResult = await uploadFileWithResult("listing-photos", path, file);

      if (!uploadResult.publicUrl) {
        continue;
      }

      const { data: insertedImage } = await supabase
        .from("listing_images")
        .insert({
          listing_id: listingId,
          image_url: uploadResult.publicUrl,
          sort_order: nextSortOrder,
        })
        .select("id,image_url,sort_order")
        .single();

      if (!coverImageUrl) {
        coverImageUrl = uploadResult.publicUrl;
      }

      if (insertedImage) {
        uploadedImages.push({
          id: insertedImage.id,
          listingId,
          imageUrl: insertedImage.image_url,
          sortOrder: insertedImage.sort_order,
        });
      }

      nextSortOrder += 1;
      uploadedCount += 1;
    }

    if (!uploadedCount) {
      return NextResponse.json(
        {
          success: false,
          message: "Photo upload failed. Please try JPG, PNG, WEBP, or HEIC.",
        },
        { status: 400 },
      );
    }

    await supabase
      .from("listings")
      .update({
        cover_image_url: coverImageUrl,
      })
      .eq("id", listingId);

    await revalidateAdminFilePaths(listingId);

    return NextResponse.json({
      success: true,
      message: `${uploadedCount} photo${uploadedCount > 1 ? "s" : ""} uploaded successfully.`,
      images: uploadedImages,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Photo upload failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
