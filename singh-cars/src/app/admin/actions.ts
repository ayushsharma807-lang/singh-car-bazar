"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type InquiryActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type SaveListingActionState = {
  status: "idle" | "error";
  message?: string;
};

async function requireAdminSession() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/admin/login?reason=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

async function uploadFile(bucket: string, path: string, file: File) {
  const result = await uploadFileWithResult(bucket, path, file);
  return result.publicUrl;
}

async function ensureStorageBucket(bucket: string) {
  const supabase = createSupabaseAdminClient();
  const shouldBePublic = bucket === "listing-photos" || bucket === "documents";

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
    contentType: file.type,
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

function getStoragePathFromPublicUrl(bucket: string, publicUrl: string) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function deletePublicFile(bucket: string, publicUrl: string | null | undefined) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !publicUrl) {
    return;
  }

  const path = getStoragePathFromPublicUrl(bucket, publicUrl);

  if (!path) {
    return;
  }

  await supabase.storage.from(bucket).remove([path]);
}

function buildBuyerNotes(address: string, notes: string) {
  const cleanAddress = address.trim();
  const cleanNotes = notes.trim();

  if (cleanAddress && cleanNotes) {
    return `Address: ${cleanAddress}\n\n${cleanNotes}`;
  }

  if (cleanAddress) {
    return `Address: ${cleanAddress}`;
  }

  return cleanNotes || null;
}

async function saveSellerRecord(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  payload: {
    listing_id: string;
    name: string;
    phone: string;
    address: string | null;
    notes: string | null;
    seller_type: string;
  },
) {
  const { data: updatedRows, error: updateError } = await supabase
    .from("sellers")
    .update(payload)
    .eq("listing_id", payload.listing_id)
    .select("id")
    .limit(1);

  if (updateError) {
    return {
      error: updateError,
    };
  }

  if ((updatedRows?.length ?? 0) > 0) {
    return {
      error: null,
    };
  }

  const { error: insertError } = await supabase.from("sellers").insert(payload);

  return {
    error: insertError,
  };
}

async function saveBuyerRecord(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  payload: {
    listing_id: string;
    name: string | null;
    phone: string | null;
    notes: string | null;
    sold_price: number | null;
    sale_date: string | null;
  },
) {
  const { data: updatedRows, error: updateError } = await supabase
    .from("buyers")
    .update(payload)
    .eq("listing_id", payload.listing_id)
    .select("id")
    .limit(1);

  if (updateError) {
    return {
      error: updateError,
    };
  }

  if ((updatedRows?.length ?? 0) > 0) {
    return {
      error: null,
    };
  }

  const { error: insertError } = await supabase.from("buyers").insert(payload);

  return {
    error: insertError,
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

async function redirectToAdminFile(listingId: string, saved?: "seller" | "car" | "buyer" | "status") {
  await revalidateAdminFilePaths(listingId);
  redirect(saved ? `/admin/files/${listingId}?saved=${saved}` : `/admin/files/${listingId}`);
}

export async function submitInquiryAction(
  _: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Inquiry setup is not ready yet. Please call or WhatsApp us for now.",
    };
  }

  const { error } = await supabase.from("inquiries").insert({
    listing_id: String(formData.get("listingId") || "") || null,
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || "") || null,
    message: String(formData.get("message") || "") || null,
  });

  if (error) {
    console.error("Inquiry insert failed", error);
    return {
      status: "error",
      message: "We could not send your inquiry. Please try again or contact us directly.",
    };
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/inventory");

  return {
    status: "success",
    message: "Inquiry sent successfully. We will contact you soon.",
  };
}

export async function adminSignOutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}

export async function saveListingAction(
  _: SaveListingActionState,
  formData: FormData,
): Promise<SaveListingActionState> {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase environment variables are required to save listings.",
    };
  }

  const listingId = String(formData.get("listingId") || "") || randomUUID();
  const uploadedImages = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const existingCoverImage = String(formData.get("coverImageUrl") || "") || null;
  const status = String(formData.get("status") || "").trim() || "available";
  const sellerType = String(formData.get("sellerType") || "dealer");
  const make = String(formData.get("make") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const fuel = String(formData.get("fuel") || "").trim();
  const transmission = String(formData.get("transmission") || "").trim();
  const numberPlate = String(formData.get("numberPlate") || "").trim();
  const sellerName = String(formData.get("sellerName") || "").trim();
  const sellerPhone = String(formData.get("sellerPhone") || "").trim();
  const year = Number(formData.get("year") || 0);
  const kmDriven = Number(formData.get("kmDriven") || 0);
  const price = Number(formData.get("price") || 0);

  if (!sellerName || !sellerPhone) {
    return {
      status: "error",
      message: "Please add seller name and phone before saving.",
    };
  }

  if (!make || !model || !numberPlate || !fuel || !transmission || !year) {
    return {
      status: "error",
      message: "Please fill the main car details before saving.",
    };
  }

  if (!price && price !== 0) {
    return {
      status: "error",
      message: "Please add the car price before saving.",
    };
  }

  const stockNumber =
    String(formData.get("stockNumber") || "").trim() ||
    `FILE-${listingId.slice(0, 8).toUpperCase()}`;
  const location = String(formData.get("location") || "").trim() || "Jalandhar";
  let coverImageUrl = existingCoverImage;

  const { error: listingError } = await supabase.from("listings").upsert({
    id: listingId,
    stock_number: stockNumber,
    number_plate: numberPlate,
    make,
    model,
    variant: String(formData.get("variant") || "") || null,
    year,
    fuel,
    transmission,
    km_driven: kmDriven,
    color: String(formData.get("color") || "") || null,
    owner_count: Number(formData.get("ownerCount") || 0) || null,
    price,
    location,
    description: String(formData.get("description") || "") || null,
    seller_type: sellerType,
    status,
    featured: formData.get("featured") === "on",
    cover_image_url: coverImageUrl,
  });

  if (listingError) {
    console.error("Listing save failed", { listingId, listingError });
    return {
      status: "error",
      message: `Car save failed: ${listingError.message}`,
    };
  }

  if (uploadedImages.length) {
    const { data: existingImages } = await supabase
      .from("listing_images")
      .select("id,image_url")
      .eq("listing_id", listingId);

    for (const existingImage of existingImages ?? []) {
      await deletePublicFile("listing-photos", existingImage.image_url);
    }

    const { error: deleteImagesError } = await supabase
      .from("listing_images")
      .delete()
      .eq("listing_id", listingId);

    if (deleteImagesError) {
      console.error("Listing image reset failed", { listingId, deleteImagesError });
      return {
        status: "error",
        message: `Car photos could not be reset: ${deleteImagesError.message}`,
      };
    }

    for (const [index, image] of uploadedImages.entries()) {
      const extension = image.name.split(".").pop() || "jpg";
      const path = `${listingId}/${index + 1}-${randomUUID()}.${extension}`;
      const uploadResult = await uploadFileWithResult("listing-photos", path, image);

      if (!uploadResult.publicUrl) {
        return {
          status: "error",
          message: uploadResult.error || "Car photo upload failed.",
        };
      }

      if (index === 0) {
        coverImageUrl = uploadResult.publicUrl;
      }

      const { error: listingImageError } = await supabase.from("listing_images").insert({
        listing_id: listingId,
        image_url: uploadResult.publicUrl,
        sort_order: index,
      });

      if (listingImageError) {
        console.error("Listing image save failed", { listingId, listingImageError });
        return {
          status: "error",
          message: `Car photo save failed: ${listingImageError.message}`,
        };
      }
    }

    const { error: coverError } = await supabase
      .from("listings")
      .update({ cover_image_url: coverImageUrl })
      .eq("id", listingId);

    if (coverError) {
      console.error("Listing cover update failed", { listingId, coverError });
      return {
        status: "error",
        message: `Cover photo save failed: ${coverError.message}`,
      };
    }
  }

  const { error: sellerError } = await saveSellerRecord(supabase, {
    listing_id: listingId,
    name: sellerName,
    phone: sellerPhone,
    address: String(formData.get("sellerAddress") || "") || null,
    notes: String(formData.get("sellerNotes") || "") || null,
    seller_type: sellerType,
  });

  if (sellerError) {
    console.error("Seller save failed", { listingId, sellerError });
    return {
      status: "error",
      message: `Seller save failed: ${sellerError.message}`,
    };
  }

  const buyerName = String(formData.get("buyerName") || "");
  const buyerPhone = String(formData.get("buyerPhone") || "");

  if (buyerName || buyerPhone) {
    const { error: buyerError } = await saveBuyerRecord(supabase, {
      listing_id: listingId,
      name: buyerName || null,
      phone: buyerPhone || null,
      notes: String(formData.get("buyerNotes") || "") || null,
      sold_price: Number(formData.get("soldPrice") || 0) || null,
      sale_date: String(formData.get("saleDate") || "") || null,
    });

    if (buyerError) {
      console.error("Buyer save failed", { listingId, buyerError });
      return {
        status: "error",
        message: `Buyer save failed: ${buyerError.message}`,
      };
    }
  } else {
    const { error: deleteBuyerError } = await supabase
      .from("buyers")
      .delete()
      .eq("listing_id", listingId);

    if (deleteBuyerError) {
      console.error("Buyer cleanup failed", { listingId, deleteBuyerError });
      return {
        status: "error",
        message: `Buyer cleanup failed: ${deleteBuyerError.message}`,
      };
    }
  }

  const documentFields = [
    "document_rc",
    "document_insurance",
    "document_seller_id",
    "document_buyer_id",
    "document_loan_noc",
    "document_other",
  ];

  for (const field of documentFields) {
    const entry = formData.get(field);

    if (!(entry instanceof File) || !entry.size) {
      continue;
    }

    const extension = entry.name.split(".").pop() || "pdf";
    const path = `${listingId}/${field}-${randomUUID()}.${extension}`;
    const uploadResult = await uploadFileWithResult("documents", path, entry);

    if (!uploadResult.publicUrl) {
      return {
        status: "error",
        message: uploadResult.error || "Document upload failed.",
      };
    }

    const { error: documentError } = await supabase.from("documents").insert({
      listing_id: listingId,
      doc_type: field.replace("document_", ""),
      file_url: uploadResult.publicUrl,
      notes: String(formData.get(`${field}_notes`) || "") || null,
    });

    if (documentError) {
      console.error("Document save failed", { listingId, field, documentError });
      return {
        status: "error",
        message: `Document save failed: ${documentError.message}`,
      };
    }
  }

  await revalidateAdminFilePaths(listingId);
  redirect(`/admin/files/${listingId}`);
}

export async function updateSellerInfoAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");

  if (!supabase || !listingId) {
    throw new Error("Unable to update seller info.");
  }

  const submittedSellerType = String(formData.get("sellerType") || "").trim();
  const { data: existingSeller } = await supabase
    .from("sellers")
    .select("seller_type")
    .eq("listing_id", listingId)
    .maybeSingle();

  const sellerType = submittedSellerType || existingSeller?.seller_type || "dealer";

  const { error } = await saveSellerRecord(supabase, {
    listing_id: listingId,
    name: String(formData.get("sellerName") || ""),
    phone: String(formData.get("sellerPhone") || ""),
    address: String(formData.get("sellerAddress") || "") || null,
    notes: String(formData.get("sellerNotes") || "") || null,
    seller_type: sellerType,
  });

  if (error) {
    console.error("Seller update failed", { listingId, error });
    throw new Error(`Seller save failed: ${error.message}`);
  }

  await redirectToAdminFile(listingId, "seller");
}

export async function updateCarInfoAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");

  if (!listingId) {
    redirect("/admin/files");
  }

  if (!supabase) {
    throw new Error("Unable to update car info.");
  }

  const status = String(formData.get("status") || "").trim() || "available";
  const { data: existingListing, error: existingError } = await supabase
    .from("listings")
    .select(
      "id,stock_number,variant,color,location,description,featured,cover_image_url,seller_type,owner_count",
    )
    .eq("id", listingId)
    .maybeSingle();

  if (existingError || !existingListing) {
    console.error("Car update failed to load existing listing", {
      listingId,
      existingError,
    });
    throw new Error(
      existingError?.message || "Car file could not be loaded before saving.",
    );
  }

  const stockNumber =
    String(formData.get("stockNumber") || "").trim() ||
    existingListing.stock_number ||
    `FILE-${listingId.slice(0, 8).toUpperCase()}`;
  const location =
    String(formData.get("location") || "").trim() || existingListing.location || "Jalandhar";

  const updatePayload = {
    stock_number: stockNumber,
    make: String(formData.get("make") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    variant:
      String(formData.get("variant") || "").trim() ||
      existingListing.variant ||
      null,
    year: Number(formData.get("year") || 0),
    number_plate: String(formData.get("numberPlate") || "").trim(),
    km_driven: Number(formData.get("kmDriven") || 0),
    fuel: String(formData.get("fuel") || "").trim(),
    transmission: String(formData.get("transmission") || "").trim(),
    price: Number(formData.get("price") || 0),
    color:
      String(formData.get("color") || "").trim() ||
      existingListing.color ||
      null,
    location,
    description:
      String(formData.get("description") || "").trim() ||
      existingListing.description ||
      null,
    status,
    featured: existingListing.featured,
    cover_image_url: existingListing.cover_image_url,
    seller_type: existingListing.seller_type,
    owner_count: existingListing.owner_count,
  };

  const { error } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", listingId);

  if (error) {
    console.error("Car update failed", { listingId, updatePayload, error });
    throw new Error(`Car save failed: ${error.message}`);
  }

  await redirectToAdminFile(listingId, "car");
}

export async function markListingSoldAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");

  if (!listingId) {
    redirect("/admin/files");
  }

  if (!supabase) {
    throw new Error("Unable to update car status.");
  }

  await supabase
    .from("listings")
    .update({
      status: "sold",
    })
    .eq("id", listingId);

  await redirectToAdminFile(listingId, "status");
}

export async function updateBuyerInfoAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");

  if (!listingId) {
    redirect("/admin/files");
  }

  if (!supabase) {
    throw new Error("Unable to update buyer info.");
  }

  const buyerName = String(formData.get("buyerName") || "");
  const buyerPhone = String(formData.get("buyerPhone") || "");
  const buyerAddress = String(formData.get("buyerAddress") || "");
  const buyerNotes = String(formData.get("buyerNotes") || "");
  const combinedNotes = buildBuyerNotes(buyerAddress, buyerNotes);

  if (!buyerName && !buyerPhone && !buyerAddress && !buyerNotes && !formData.get("soldPrice") && !formData.get("saleDate")) {
    await supabase.from("buyers").delete().eq("listing_id", listingId);
  } else {
    const { error } = await saveBuyerRecord(supabase, {
      listing_id: listingId,
      name: buyerName || null,
      phone: buyerPhone || null,
      notes: combinedNotes,
      sold_price: Number(formData.get("soldPrice") || 0) || null,
      sale_date: String(formData.get("saleDate") || "") || null,
    });

    if (error) {
      console.error("Buyer update failed", { listingId, error });
      throw new Error(`Buyer save failed: ${error.message}`);
    }
  }

  await redirectToAdminFile(listingId, "buyer");
}

export async function uploadListingImagesAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!listingId) {
    redirect("/admin/files");
  }

  if (!supabase) {
    throw new Error("Unable to upload car photos.");
  }

  if (!files.length) {
    await redirectToAdminFile(listingId);
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

  for (const file of files) {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${listingId}/${Date.now()}-${randomUUID()}.${extension}`;
    const publicUrl = await uploadFile("listing-photos", path, file);

    if (!publicUrl) {
      continue;
    }

    await supabase.from("listing_images").insert({
      listing_id: listingId,
      image_url: publicUrl,
      sort_order: nextSortOrder,
    });

    if (!coverImageUrl) {
      coverImageUrl = publicUrl;
    }

    nextSortOrder += 1;
  }

  await supabase.from("listings").update({
    cover_image_url: coverImageUrl,
  }).eq("id", listingId);

  await redirectToAdminFile(listingId);
}

export async function removeListingImageAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const imageId = String(formData.get("imageId") || "");

  if (!listingId) {
    redirect("/admin/files");
  }

  if (!imageId) {
    await redirectToAdminFile(listingId);
  }

  if (!supabase) {
    throw new Error("Unable to remove photo.");
  }

  const { data: image } = await supabase
    .from("listing_images")
    .select("image_url")
    .eq("id", imageId)
    .maybeSingle();

  if (image?.image_url) {
    await deletePublicFile("listing-photos", image.image_url);
  }

  await supabase.from("listing_images").delete().eq("id", imageId);

  const { data: remainingImages } = await supabase
    .from("listing_images")
    .select("image_url,sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  await supabase.from("listings").update({
    cover_image_url: remainingImages?.[0]?.image_url ?? null,
  }).eq("id", listingId);

  await redirectToAdminFile(listingId);
}

export async function replaceDocumentAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const docType = String(formData.get("docType") || "");
  const file = formData.get("file");

  if (!listingId) {
    redirect("/admin/files");
  }

  if (!docType || !(file instanceof File) || !file.size) {
    await redirectToAdminFile(listingId);
  }

  if (!supabase) {
    throw new Error("Unable to upload document.");
  }

  const upload = file as File;

  const { data: existingDocs } = await supabase
    .from("documents")
    .select("id,file_url")
    .eq("listing_id", listingId)
    .eq("doc_type", docType);

  for (const document of existingDocs ?? []) {
    await deletePublicFile("documents", document.file_url);
  }

  await supabase.from("documents").delete().eq("listing_id", listingId).eq("doc_type", docType);

  const extension = upload.name.split(".").pop() || "pdf";
  const path = `${listingId}/${docType}-${randomUUID()}.${extension}`;
  const publicUrl = await uploadFile("documents", path, upload);

  if (publicUrl) {
    await supabase.from("documents").insert({
      listing_id: listingId,
      doc_type: docType,
      file_url: publicUrl,
      notes: null,
    });
  }

  await redirectToAdminFile(listingId);
}

export async function uploadDocumentInlineAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const docType = String(formData.get("docType") || "");
  const file = formData.get("file");

  if (!listingId) {
    return {
      success: false,
      message: "Car file was not found.",
    };
  }

  if (!(file instanceof File) || !file.size) {
    return {
      success: false,
      message: "Please choose a file first.",
    };
  }

  if (!docType) {
    return {
      success: false,
      message: "Document type is missing.",
    };
  }

  if (!supabase) {
    return {
      success: false,
      message: "Supabase admin connection is missing.",
    };
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const hasAllowedExtension = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".doc", ".docx"]
    .some((extension) => file.name.toLowerCase().endsWith(extension));

  if (!allowedTypes.includes(file.type) && !hasAllowedExtension) {
    return {
      success: false,
      message: "Please upload PDF, JPG, JPEG, PNG, WEBP, HEIC, HEIF, DOC, or DOCX.",
    };
  }

  const extension = file.name.split(".").pop() || "pdf";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const folder =
    docType === "seller_id" ? "seller-docs" : docType === "buyer_id" ? "buyer-docs" : "documents";
  const finalName = safeName.includes(".") ? safeName : `${safeName}.${extension}`;
  const path = `${folder}/${listingId}/${Date.now()}-${finalName}`;
  const uploadResult = await uploadFileWithResult("documents", path, file);

  if (!uploadResult.publicUrl) {
    return {
      success: false,
      message: uploadResult.error || "Document upload failed.",
    };
  }

  const notePayload = JSON.stringify({
    originalName: file.name,
    mimeType: file.type || null,
  });

  const { data: insertedDocument, error } = await supabase
    .from("documents")
    .insert({
      listing_id: listingId,
      doc_type: docType,
      file_url: uploadResult.publicUrl,
      notes: notePayload,
    })
    .select("id,listing_id,doc_type,file_url,notes")
    .single();

  if (error || !insertedDocument) {
    return {
      success: false,
      message: error?.message || "Document could not be saved.",
    };
  }

  await revalidateAdminFilePaths(listingId);

  return {
    success: true,
    message: `${file.name} uploaded successfully.`,
    documentId: insertedDocument.id,
    fileName: file.name,
    fileUrl: uploadResult.publicUrl,
    docType,
    notes: notePayload,
  };
}

export async function removeDocumentByIdAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const documentId = String(formData.get("documentId") || "");

  if (!listingId || !documentId) {
    return {
      success: false,
      message: "File remove request is missing details.",
    };
  }

  if (!supabase) {
    return {
      success: false,
      message: "Supabase admin connection is missing.",
    };
  }

  const { data: document } = await supabase
    .from("documents")
    .select("id,file_url")
    .eq("id", documentId)
    .maybeSingle();

  if (!document) {
    return {
      success: false,
      message: "File was not found.",
    };
  }

  await deletePublicFile("documents", document.file_url);
  const { error } = await supabase.from("documents").delete().eq("id", documentId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  await revalidateAdminFilePaths(listingId);

  return {
    success: true,
    message: "File removed.",
    documentId,
  };
}

export async function uploadListingImagesInlineAction(formData: FormData) {
  try {
    await requireAdminSession();

    const supabase = createSupabaseAdminClient();
    const listingId = String(formData.get("listingId") || "");
    const files = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!listingId) {
      return {
        success: false,
        message: "Car file was not found.",
      };
    }

    if (!files.length) {
      return {
        success: false,
        message: "Please choose at least one photo.",
      };
    }

    if (!supabase) {
      return {
        success: false,
        message: "Supabase admin connection is missing.",
      };
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
      const hasImageExtension = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]
        .some((extension) => file.name.toLowerCase().endsWith(extension));

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
      return {
        success: false,
        message: "Photo upload failed. Please try JPG, JPEG, PNG, WEBP, HEIC, or HEIF.",
      };
    }

    await supabase
      .from("listings")
      .update({
        cover_image_url: coverImageUrl,
      })
      .eq("id", listingId);

    await revalidateAdminFilePaths(listingId);

    return {
      success: true,
      message: `${uploadedCount} photo${uploadedCount > 1 ? "s" : ""} uploaded successfully.`,
      images: uploadedImages,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Photo upload failed. Please try again.",
    };
  }
}

export async function removeListingImageByIdAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const imageId = String(formData.get("imageId") || "");

  if (!listingId || !imageId) {
    return {
      success: false,
      message: "Photo remove request is missing details.",
    };
  }

  if (!supabase) {
    return {
      success: false,
      message: "Supabase admin connection is missing.",
    };
  }

  const { data: image } = await supabase
    .from("listing_images")
    .select("image_url")
    .eq("id", imageId)
    .maybeSingle();

  if (!image) {
    return {
      success: false,
      message: "Photo was not found.",
    };
  }

  await deletePublicFile("listing-photos", image.image_url);
  const { error } = await supabase.from("listing_images").delete().eq("id", imageId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const { data: remainingImages } = await supabase
    .from("listing_images")
    .select("image_url,sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  await supabase
    .from("listings")
    .update({
      cover_image_url: remainingImages?.[0]?.image_url ?? null,
    })
    .eq("id", listingId);

  await revalidateAdminFilePaths(listingId);

  return {
    success: true,
    message: "Photo removed.",
    imageId,
  };
}

export async function setListingCoverImageAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const imageId = String(formData.get("imageId") || "");

  if (!listingId || !imageId) {
    return {
      success: false,
      message: "Cover image request is missing details.",
    };
  }

  if (!supabase) {
    return {
      success: false,
      message: "Supabase admin connection is missing.",
    };
  }

  const { data: image } = await supabase
    .from("listing_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (!image) {
    return {
      success: false,
      message: "Photo was not found.",
    };
  }

  const { error } = await supabase
    .from("listings")
    .update({
      cover_image_url: image.image_url,
    })
    .eq("id", listingId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  await revalidateAdminFilePaths(listingId);

  return {
    success: true,
    message: "Cover photo updated.",
    imageId,
    imageUrl: image.image_url,
  };
}

export async function removeDocumentAction(formData: FormData) {
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();
  const listingId = String(formData.get("listingId") || "");
  const docType = String(formData.get("docType") || "");

  if (!listingId) {
    redirect("/admin/files");
  }

  if (!docType) {
    await redirectToAdminFile(listingId);
  }

  if (!supabase) {
    throw new Error("Unable to remove document.");
  }

  const { data: existingDocs } = await supabase
    .from("documents")
    .select("id,file_url")
    .eq("listing_id", listingId)
    .eq("doc_type", docType);

  for (const document of existingDocs ?? []) {
    await deletePublicFile("documents", document.file_url);
  }

  await supabase.from("documents").delete().eq("listing_id", listingId).eq("doc_type", docType);

  await redirectToAdminFile(listingId);
}
