import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DocumentField = {
  field: string;
  label: string;
  docType: string;
};

const documentFields: DocumentField[] = [
  { field: "document_rc", label: "RC", docType: "rc" },
  { field: "document_insurance", label: "Insurance", docType: "insurance" },
  { field: "document_seller_id", label: "Seller documents", docType: "seller_id" },
  { field: "document_buyer_id", label: "Buyer documents", docType: "buyer_id" },
  { field: "document_loan_noc", label: "Loan / NOC", docType: "loan_noc" },
  { field: "document_other", label: "Other papers", docType: "other" },
];

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

async function requireAdminUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase environment variables are required to create files.",
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      message: "Your admin session expired. Please sign in again.",
    };
  }

  return {
    ok: true,
    user,
  };
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

async function getStoragePathFromPublicUrl(bucket: string, publicUrl: string) {
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

  const path = await getStoragePathFromPublicUrl(bucket, publicUrl);

  if (!path) {
    return;
  }

  await supabase.storage.from(bucket).remove([path]);
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
    return { error: updateError };
  }

  if ((updatedRows?.length ?? 0) > 0) {
    return { error: null };
  }

  const { error: insertError } = await supabase.from("sellers").insert(payload);
  return { error: insertError };
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
    return { error: updateError };
  }

  if ((updatedRows?.length ?? 0) > 0) {
    return { error: null };
  }

  const { error: insertError } = await supabase.from("buyers").insert(payload);
  return { error: insertError };
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

async function revalidateCreateFilePaths(listingId: string) {
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
    const auth = await requireAdminUser();

    if (!auth.ok) {
      return jsonError(auth.message || "Your admin session expired. Please sign in again.", 401);
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return jsonError("Supabase admin connection is missing.", 500);
    }

    const formData = await request.formData();
    const listingId = String(formData.get("listingId") || "") || randomUUID();
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
    const status = String(formData.get("status") || "").trim() || "available";
    const stockNumber =
      String(formData.get("stockNumber") || "").trim() ||
      `FILE-${listingId.slice(0, 8).toUpperCase()}`;
    const location = String(formData.get("location") || "").trim() || "Jalandhar";
    let coverImageUrl = String(formData.get("coverImageUrl") || "") || null;

    if (!sellerName || !sellerPhone) {
      return jsonError("Please add seller name and phone before saving.");
    }

    if (!make || !model || !numberPlate || !fuel || !transmission || !year) {
      return jsonError("Please add car name, number plate, year, fuel, gear, and price before saving.");
    }

    if (!price && price !== 0) {
      return jsonError("Please add the car price before saving.");
    }

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
      console.error("Create file failed at listing save", { listingId, listingError });
      return jsonError(`Car save failed: ${listingError.message}`, 500);
    }

    console.info("Create file listing saved", { listingId });

    const uploadedImages = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

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
        console.error("Create file failed at image reset", { listingId, deleteImagesError });
        return jsonError(`Car photos could not be reset: ${deleteImagesError.message}`, 500);
      }

      for (const [index, image] of uploadedImages.entries()) {
        const extension = image.name.split(".").pop() || "jpg";
        const path = `${listingId}/${index + 1}-${randomUUID()}.${extension}`;
        const uploadResult = await uploadFileWithResult("listing-photos", path, image);

        if (!uploadResult.publicUrl) {
          console.error("Create file failed at car photo upload", {
            listingId,
            fileName: image.name,
            error: uploadResult.error,
          });
          return jsonError(`Car photo upload failed: ${image.name}`, 500);
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
          console.error("Create file failed at listing_images insert", {
            listingId,
            fileName: image.name,
            listingImageError,
          });
          return jsonError(`Car photo save failed: ${listingImageError.message}`, 500);
        }
      }

      const { error: coverError } = await supabase
        .from("listings")
        .update({ cover_image_url: coverImageUrl })
        .eq("id", listingId);

      if (coverError) {
        console.error("Create file failed at cover update", { listingId, coverError });
        return jsonError(`Cover photo save failed: ${coverError.message}`, 500);
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
      console.error("Create file failed at seller save", { listingId, sellerError });
      return jsonError(`Seller save failed: ${sellerError.message}`, 500);
    }

    console.info("Create file seller saved", { listingId });

    const buyerName = String(formData.get("buyerName") || "");
    const buyerPhone = String(formData.get("buyerPhone") || "");
    const buyerAddress = String(formData.get("buyerAddress") || "");
    const buyerNotes = String(formData.get("buyerNotes") || "");
    const combinedBuyerNotes = buildBuyerNotes(buyerAddress, buyerNotes);
    const soldPrice = Number(formData.get("soldPrice") || 0) || null;
    const saleDate = String(formData.get("saleDate") || "") || null;
    const hasBuyerData = Boolean(
      buyerName.trim() ||
        buyerPhone.trim() ||
        buyerAddress.trim() ||
        buyerNotes.trim() ||
        soldPrice ||
        saleDate,
    );

    if (hasBuyerData) {
      const { error: buyerError } = await saveBuyerRecord(supabase, {
        listing_id: listingId,
        name: buyerName || null,
        phone: buyerPhone || null,
        notes: combinedBuyerNotes,
        sold_price: soldPrice,
        sale_date: saleDate,
      });

      if (buyerError) {
        console.error("Create file failed at buyer save", { listingId, buyerError });
        return jsonError(`Buyer save failed: ${buyerError.message}`, 500);
      }

      console.info("Create file buyer saved", { listingId });
    }

    for (const documentField of documentFields) {
      const files = formData
        .getAll(documentField.field)
        .filter((entry): entry is File => entry instanceof File && entry.size > 0);

      if (!files.length) {
        continue;
      }

      const { data: existingDocs } = await supabase
        .from("documents")
        .select("id,file_url")
        .eq("listing_id", listingId)
        .eq("doc_type", documentField.docType);

      for (const document of existingDocs ?? []) {
        await deletePublicFile("documents", document.file_url);
      }

      const { error: deleteDocsError } = await supabase
        .from("documents")
        .delete()
        .eq("listing_id", listingId)
        .eq("doc_type", documentField.docType);

      if (deleteDocsError) {
        console.error("Create file failed at document reset", {
          listingId,
          field: documentField.field,
          deleteDocsError,
        });
        return jsonError(`${documentField.label} could not be reset.`, 500);
      }

      for (const file of files) {
        const extension = file.name.split(".").pop() || "pdf";
        const path = `${listingId}/${documentField.field}-${randomUUID()}.${extension}`;
        const uploadResult = await uploadFileWithResult("documents", path, file);

        if (!uploadResult.publicUrl) {
          console.error("Create file failed at document upload", {
            listingId,
            field: documentField.field,
            fileName: file.name,
            error: uploadResult.error,
          });
          return jsonError(`${documentField.label} upload failed: ${file.name}`, 500);
        }

        const { error: documentError } = await supabase.from("documents").insert({
          listing_id: listingId,
          doc_type: documentField.docType,
          file_url: uploadResult.publicUrl,
          notes: JSON.stringify({
            originalName: file.name,
            mimeType: file.type || null,
          }),
        });

        if (documentError) {
          console.error("Create file failed at document insert", {
            listingId,
            field: documentField.field,
            fileName: file.name,
            documentError,
          });
          return jsonError(`${documentField.label} save failed: ${documentError.message}`, 500);
        }
      }

      console.info("Create file documents saved", {
        listingId,
        field: documentField.field,
        count: files.length,
      });
    }

    await revalidateCreateFilePaths(listingId);

    return NextResponse.json({
      success: true,
      message: "Car saved successfully.",
      listingId,
      redirectTo: `/admin?saved=car&file=${listingId}`,
    });
  } catch (error) {
    console.error("Create file route crashed", error);
    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not create file. Please try again.",
      500,
    );
  }
}
