"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireAdminSession() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
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
  const supabase = createSupabaseAdminClient();

  if (!supabase || !file.size) {
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
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
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.from("inquiries").insert({
      listing_id: String(formData.get("listingId") || "") || null,
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || "") || null,
      message: String(formData.get("message") || "") || null,
    });
  }

  revalidatePath("/");
  revalidatePath("/contact");
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
  await requireAdminSession();

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are required to save listings.");
  }

  const listingId = String(formData.get("listingId") || "") || randomUUID();
  const uploadedImages = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const existingCoverImage = String(formData.get("coverImageUrl") || "") || null;

  let coverImageUrl = existingCoverImage;

  if (uploadedImages.length) {
    await supabase.from("listing_images").delete().eq("listing_id", listingId);

    for (const [index, image] of uploadedImages.entries()) {
      const extension = image.name.split(".").pop() || "jpg";
      const path = `${listingId}/${index + 1}-${randomUUID()}.${extension}`;
      const publicUrl = await uploadFile("listing-photos", path, image);

      if (!publicUrl) {
        continue;
      }

      if (index === 0 && !coverImageUrl) {
        coverImageUrl = publicUrl;
      }

      await supabase.from("listing_images").insert({
        listing_id: listingId,
        image_url: publicUrl,
        sort_order: index,
      });
    }
  }

  await supabase.from("listings").upsert({
    id: listingId,
    stock_number: String(formData.get("stockNumber") || ""),
    number_plate: String(formData.get("numberPlate") || ""),
    make: String(formData.get("make") || ""),
    model: String(formData.get("model") || ""),
    variant: String(formData.get("variant") || "") || null,
    year: Number(formData.get("year") || 0),
    fuel: String(formData.get("fuel") || ""),
    transmission: String(formData.get("transmission") || ""),
    km_driven: Number(formData.get("kmDriven") || 0),
    color: String(formData.get("color") || "") || null,
    owner_count: Number(formData.get("ownerCount") || 0) || null,
    price: Number(formData.get("price") || 0),
    location: String(formData.get("location") || ""),
    description: String(formData.get("description") || "") || null,
    seller_type: String(formData.get("sellerType") || "dealer"),
    status: String(formData.get("status") || "available"),
    featured: formData.get("featured") === "on",
    cover_image_url: coverImageUrl,
  });

  await supabase.from("sellers").upsert({
    listing_id: listingId,
    name: String(formData.get("sellerName") || ""),
    phone: String(formData.get("sellerPhone") || ""),
    address: String(formData.get("sellerAddress") || "") || null,
    notes: String(formData.get("sellerNotes") || "") || null,
    seller_type: String(formData.get("sellerType") || "dealer"),
  });

  const buyerName = String(formData.get("buyerName") || "");
  const buyerPhone = String(formData.get("buyerPhone") || "");

  if (buyerName || buyerPhone) {
    await supabase.from("buyers").upsert({
      listing_id: listingId,
      name: buyerName || null,
      phone: buyerPhone || null,
      notes: String(formData.get("buyerNotes") || "") || null,
      sold_price: Number(formData.get("soldPrice") || 0) || null,
      sale_date: String(formData.get("saleDate") || "") || null,
    });
  } else {
    await supabase.from("buyers").delete().eq("listing_id", listingId);
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
    const publicUrl = await uploadFile("documents", path, entry);

    if (!publicUrl) {
      continue;
    }

    await supabase.from("documents").insert({
      listing_id: listingId,
      doc_type: field.replace("document_", ""),
      file_url: publicUrl,
      notes: String(formData.get(`${field}_notes`) || "") || null,
    });
  }

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  redirect("/admin/listings");
}
