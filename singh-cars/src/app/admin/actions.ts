"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSlug } from "@/lib/utils";

async function uploadFile(
  bucket: string,
  path: string,
  file: File,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !file.size) {
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function submitInquiryAction(formData: FormData) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    await supabase.from("inquiries").insert({
      listing_id: String(formData.get("listingId") || "") || null,
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || "") || null,
      message: String(formData.get("message") || "") || null,
      car_title: String(formData.get("carTitle") || "") || null,
    });
  }

  revalidatePath("/");
  revalidatePath("/inventory");
}

export async function adminSignOutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}

export async function saveListingAction(formData: FormData) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin environment variables are required to save listings.");
  }

  const listingId = String(formData.get("listingId") || "") || randomUUID();
  const sellerId = randomUUID();
  const slug = createSlug(
    String(formData.get("make") || ""),
    String(formData.get("model") || ""),
    String(formData.get("year") || ""),
    String(formData.get("stockNumber") || ""),
  );

  const sellerPayload = {
    id: sellerId,
    seller_type: String(formData.get("sellerType") || "dealer"),
    name: String(formData.get("sellerName") || ""),
    phone: String(formData.get("sellerPhone") || ""),
    address: String(formData.get("sellerAddress") || "") || null,
    notes: String(formData.get("sellerNotes") || "") || null,
  };

  await supabase.from("sellers").insert(sellerPayload);

  await supabase.from("listings").upsert({
    id: listingId,
    slug,
    seller_id: sellerId,
    seller_type: String(formData.get("sellerType") || "dealer"),
    stock_number: String(formData.get("stockNumber") || ""),
    number_plate: String(formData.get("numberPlate") || ""),
    make: String(formData.get("make") || ""),
    model: String(formData.get("model") || ""),
    variant: String(formData.get("variant") || "") || null,
    year: Number(formData.get("year") || 0),
    registration_year: Number(formData.get("registrationYear") || 0) || null,
    fuel: String(formData.get("fuel") || ""),
    transmission: String(formData.get("transmission") || ""),
    km_driven: Number(formData.get("kmDriven") || 0),
    color: String(formData.get("color") || "") || null,
    owner_number: Number(formData.get("ownerNumber") || 0) || null,
    price: Number(formData.get("price") || 0),
    location: String(formData.get("location") || ""),
    description: String(formData.get("description") || "") || null,
    featured: formData.get("featured") === "on",
    status: String(formData.get("status") || "available"),
    is_published: formData.get("isPublished") === "on",
  });

  const buyerName = String(formData.get("buyerName") || "");
  const buyerPhone = String(formData.get("buyerPhone") || "");

  if (buyerName || buyerPhone) {
    await supabase.from("buyers").upsert({
      listing_id: listingId,
      name: buyerName || null,
      phone: buyerPhone || null,
      notes: String(formData.get("buyerNotes") || "") || null,
      sale_date: String(formData.get("saleDate") || "") || null,
      sold_price: Number(formData.get("soldPrice") || 0) || null,
    });
  }

  const uploadedImages = formData.getAll("images").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const existingFeaturedImage = String(formData.get("featuredImageUrl") || "");

  if (uploadedImages.length) {
    await supabase.from("listing_images").delete().eq("listing_id", listingId);
  }

  let featuredImageUsed = false;
  for (const [index, image] of uploadedImages.entries()) {
    const extension = image.name.split(".").pop() || "jpg";
    const path = `${listingId}/${index + 1}-${randomUUID()}.${extension}`;
    const publicUrl = await uploadFile("car-media", path, image);

    if (!publicUrl) {
      continue;
    }

    const isFeatured = existingFeaturedImage
      ? existingFeaturedImage === publicUrl
      : index === 0;
    featuredImageUsed ||= isFeatured;

    await supabase.from("listing_images").insert({
      listing_id: listingId,
      image_url: publicUrl,
      is_featured: isFeatured,
      sort_order: index,
    });
  }

  if (existingFeaturedImage) {
    await supabase.from("listing_images").update({ is_featured: false }).eq("listing_id", listingId);
    await supabase
      .from("listing_images")
      .upsert({
        listing_id: listingId,
        image_url: existingFeaturedImage,
        is_featured: true,
        sort_order: 0,
      });
  } else if (!featuredImageUsed && uploadedImages.length) {
    const { data } = await supabase
      .from("listing_images")
      .select("id")
      .eq("listing_id", listingId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      await supabase.from("listing_images").update({ is_featured: true }).eq("id", data.id);
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
    const publicUrl = await uploadFile("car-documents", path, entry);

    if (!publicUrl) {
      continue;
    }

    await supabase.from("listing_documents").insert({
      listing_id: listingId,
      document_type: field.replace("document_", ""),
      file_name: entry.name,
      file_url: publicUrl,
    });
  }

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  redirect("/admin/listings");
}
