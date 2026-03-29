import { unstable_noStore as noStore } from "next/cache";
import { demoInquiries, demoListings } from "@/lib/demo-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AdminFileRecord,
  DealerDashboardSummary,
  Inquiry,
  InventoryFilters,
  Listing,
} from "@/types";

type ListingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  stock_number: string;
  number_plate: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  fuel: string;
  transmission: string;
  km_driven: number;
  color: string | null;
  owner_count: number | null;
  price: number;
  location: string;
  description: string | null;
  seller_type: "dealer" | "private";
  status: "available" | "booked" | "sold";
  featured: boolean;
  cover_image_url: string | null;
  listing_images:
    | {
        id: string;
        listing_id: string;
        image_url: string;
        sort_order: number;
      }[]
    | null;
  sellers:
    | {
        id: string;
        listing_id: string;
        name: string;
        phone: string;
        address: string | null;
        notes: string | null;
        seller_type: "dealer" | "private";
      }[]
    | null;
  buyers:
    | {
        id: string;
        listing_id: string;
        name: string | null;
        phone: string | null;
        notes: string | null;
        sold_price: number | null;
        sale_date: string | null;
      }[]
    | null;
  documents:
    | {
        id: string;
        listing_id: string;
        doc_type: string;
        file_url: string;
        notes: string | null;
      }[]
    | null;
};

function getStoragePath(url: string, bucket: string) {
  if (!url) {
    return null;
  }

  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const signMarker = `/storage/v1/object/sign/${bucket}/`;

  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const publicIndex = pathname.indexOf(publicMarker);
    const signIndex = pathname.indexOf(signMarker);

    if (publicIndex >= 0) {
      return decodeURIComponent(pathname.slice(publicIndex + publicMarker.length));
    }

    if (signIndex >= 0) {
      return decodeURIComponent(pathname.slice(signIndex + signMarker.length));
    }
  } catch {
    return url;
  }

  return null;
}

function getAppStorageUrl(url: string | null, bucket: string) {
  if (!url) {
    return url;
  }

  const storagePath = getStoragePath(url, bucket);

  if (!storagePath) {
    return url;
  }

  return `/api/storage-file?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(storagePath)}`;
}

function mapListing(row: ListingRow): Listing {
  const images =
    row.listing_images?.map((image) => ({
      id: image.id,
      listingId: image.listing_id,
      imageUrl: image.image_url,
      sortOrder: image.sort_order,
    })) ?? [];

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stockNumber: row.stock_number,
    numberPlate: row.number_plate,
    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    fuel: row.fuel,
    transmission: row.transmission,
    kmDriven: row.km_driven,
    color: row.color,
    ownerCount: row.owner_count,
    price: row.price,
    location: row.location,
    description: row.description,
    sellerType: row.seller_type,
    status: row.status,
    featured: row.featured,
    coverImageUrl: row.cover_image_url,
    images: images.sort((left, right) => left.sortOrder - right.sortOrder),
    seller: row.sellers?.[0]
      ? {
          id: row.sellers[0].id,
          listingId: row.sellers[0].listing_id,
          name: row.sellers[0].name,
          phone: row.sellers[0].phone,
          address: row.sellers[0].address,
          notes: row.sellers[0].notes,
          sellerType: row.sellers[0].seller_type,
        }
      : null,
    buyer: row.buyers?.[0]
      ? {
          id: row.buyers[0].id,
          listingId: row.buyers[0].listing_id,
          name: row.buyers[0].name,
          phone: row.buyers[0].phone,
          notes: row.buyers[0].notes,
          soldPrice: row.buyers[0].sold_price,
          saleDate: row.buyers[0].sale_date,
        }
      : null,
    documents:
      row.documents?.map((document) => ({
        id: document.id,
        listingId: document.listing_id,
        docType: document.doc_type,
        fileUrl: document.file_url,
        notes: document.notes,
      })) ?? [],
  };
}

async function ensureAdminBucketIsPublic(bucket: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const { data: existingBucket, error } = await supabase.storage.getBucket(bucket);

  if (error || !existingBucket || existingBucket.public) {
    return;
  }

  const { error: updateError } = await supabase.storage.updateBucket(bucket, {
    public: true,
  });

  if (updateError) {
    console.error(`Could not make ${bucket} public`, updateError);
  }
}

async function enrichListingUrls(listing: Listing) {
  const signedCoverImageUrl = getAppStorageUrl(listing.coverImageUrl ?? null, "listing-photos");

  const signedImages = listing.images.map((image) => ({
    ...image,
    imageUrl: getAppStorageUrl(image.imageUrl, "listing-photos") || image.imageUrl,
  }));

  const signedDocuments = listing.documents.map((document) => ({
    ...document,
    fileUrl: getAppStorageUrl(document.fileUrl, "documents") || document.fileUrl,
  }));

  return {
    ...listing,
    coverImageUrl: signedCoverImageUrl,
    images: signedImages,
    documents: signedDocuments,
  };
}

export function buildListingTitle(listing: Pick<Listing, "year" | "make" | "model" | "variant">) {
  return [listing.year, listing.make, listing.model, listing.variant]
    .filter((value) => value && String(value).trim())
    .join(" ")
    .trim();
}

export function getPrimaryListingImage(
  listing: Pick<Listing, "coverImageUrl" | "images">,
) {
  return listing.coverImageUrl || listing.images[0]?.imageUrl || "";
}

export function getPublicListingStatus(
  listing: Pick<Listing, "status" | "make" | "model" | "variant" | "year" | "price" | "images" | "coverImageUrl">,
) {
  const missing: string[] = [];
  const title = buildListingTitle(listing);
  const hasPhoto = Boolean(listing.coverImageUrl || listing.images.length);

  if (listing.status !== "available") {
    missing.push("status");
  }

  if (!title) {
    missing.push("title");
  }

  if (!listing.price) {
    missing.push("price");
  }

  if (!hasPhoto) {
    missing.push("photo");
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}

export function getPublicListingChecklist(missing: string[]) {
  const labels: Record<string, string> = {
    title: "Missing title",
    price: "Missing price",
    photo: "Missing photo",
    status: "Mark as available",
  };

  return missing.map((item) => labels[item] ?? `Missing ${item}`);
}

export function buildAdminCarName(
  listing: Pick<Listing, "make" | "model" | "variant">,
) {
  const title = [listing.make, listing.model, listing.variant]
    .filter((value) => value && String(value).trim())
    .join(" ")
    .trim();

  return title || "No car details added";
}

function applyInventoryFilters(listings: Listing[], filters: InventoryFilters) {
  return listings.filter((listing) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const haystack =
        `${listing.make} ${listing.model} ${listing.variant ?? ""}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (filters.brand && listing.make.toLowerCase() !== filters.brand.toLowerCase()) {
      return false;
    }

    if (filters.model && listing.model.toLowerCase() !== filters.model.toLowerCase()) {
      return false;
    }

    if (filters.fuel && listing.fuel.toLowerCase() !== filters.fuel.toLowerCase()) {
      return false;
    }

    if (
      filters.transmission &&
      listing.transmission.toLowerCase() !== filters.transmission.toLowerCase()
    ) {
      return false;
    }

    if (filters.year && String(listing.year) !== filters.year) {
      return false;
    }

    if (filters.price) {
      const limit = Number(filters.price);
      if (!Number.isNaN(limit) && listing.price > limit) {
        return false;
      }
    }

    return true;
  });
}

async function getPublicSupabase() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return createServerSupabaseClient();
}

async function fetchListingsFromSupabase({
  admin = false,
  filters = {},
}: {
  admin?: boolean;
  filters?: InventoryFilters;
}) {
  if (admin) {
    noStore();
  }

  const supabase = admin
    ? createSupabaseAdminClient()
    : await getPublicSupabase();

  if (!supabase) {
    if (admin) {
      throw new Error("Supabase admin access is not configured.");
    }

    return null;
  }

  if (admin) {
    await ensureAdminBucketIsPublic("listing-photos");
    await ensureAdminBucketIsPublic("documents");
  }

  let query = supabase
    .from("listings")
    .select(
      "id,created_at,updated_at,stock_number,number_plate,make,model,variant,year,fuel,transmission,km_driven,color,owner_count,price,location,description,seller_type,status,featured,cover_image_url,listing_images(id,listing_id,image_url,sort_order),sellers(id,listing_id,name,phone,address,notes,seller_type),buyers(id,listing_id,name,phone,notes,sold_price,sale_date),documents(id,listing_id,doc_type,file_url,notes)",
    )
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (!admin) {
    query = query.eq("status", "available");
  }

  if (filters.brand) {
    query = query.ilike("make", filters.brand);
  }

  if (filters.model) {
    query = query.ilike("model", filters.model);
  }

  if (filters.fuel) {
    query = query.eq("fuel", filters.fuel);
  }

  if (filters.transmission) {
    query = query.eq("transmission", filters.transmission);
  }

  if (filters.year) {
    query = query.eq("year", Number(filters.year));
  }

  if (filters.price) {
    query = query.lte("price", Number(filters.price));
  }

  if (filters.search) {
    query = query.or(
      `make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,variant.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;

  if (error || !data) {
    if (admin) {
      throw new Error(error?.message || "Could not load admin listings.");
    }

    return null;
  }

  const listings = data.map((row) => mapListing(row as ListingRow));
  return Promise.all(listings.map(enrichListingUrls));
}

export async function getListings(filters: InventoryFilters = {}) {
  const listings = await fetchListingsFromSupabase({ filters });
  if (listings) {
    return listings.filter((listing) => getPublicListingStatus(listing).ready);
  }

  return applyInventoryFilters(
    demoListings.filter((listing) => getPublicListingStatus(listing).ready),
    filters,
  );
}

export async function getFeaturedListings(limit = 3) {
  const listings = await getListings();
  return listings.filter((listing) => listing.featured).slice(0, limit);
}

export async function getListingById(id: string) {
  const listings = await getListings();
  return listings.find((listing) => listing.id === id) ?? null;
}

export async function getAdminListings(filters: {
  search?: string;
  status?: string;
  sellerType?: string;
} = {}) {
  const listings = (await fetchListingsFromSupabase({
    admin: true,
    filters: {
      search: filters.search,
    },
  })) ?? [];

  return listings.filter((listing) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const haystack =
        `${listing.stockNumber} ${listing.numberPlate} ${listing.make} ${listing.model}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (filters.status && listing.status !== filters.status) {
      return false;
    }

    if (filters.sellerType && listing.sellerType !== filters.sellerType) {
      return false;
    }

    return true;
  });
}

function inferDocumentStatus(listing: Listing) {
  const sellerReady = listing.documents.some(
    (document) => document.docType === "seller_id",
  );
  const carDocsReady = listing.documents.some((document) =>
    ["rc", "insurance", "loan_noc", "other"].includes(document.docType),
  );
  const carPhotosReady = Boolean(listing.coverImageUrl || listing.images.length);
  const buyerReady = listing.documents.some(
    (document) => document.docType === "buyer_id",
  );

  return {
    sellerReady,
    carReady: carDocsReady && carPhotosReady,
    buyerReady,
  };
}

function isSellerInfoComplete(listing: Listing) {
  return Boolean(listing.seller?.name?.trim() && listing.seller?.phone?.trim());
}

function isCarInfoComplete(listing: Listing) {
  return Boolean(
    listing.numberPlate?.trim() &&
      listing.make?.trim() &&
      listing.model?.trim() &&
      listing.year &&
      listing.kmDriven >= 0 &&
      listing.fuel?.trim() &&
      listing.transmission?.trim() &&
      listing.price,
  );
}

function isBuyerInfoComplete(listing: Listing) {
  return Boolean(
    listing.buyer?.name?.trim() &&
      listing.buyer?.phone?.trim() &&
      (listing.buyer?.soldPrice || listing.price),
  );
}

export function isCompletedFile(listing: Listing) {
  const sellerDocsReady = listing.documents.some((document) => document.docType === "seller_id");
  const carDocsReady = listing.documents.some((document) =>
    ["rc", "insurance", "loan_noc", "other"].includes(document.docType),
  );
  const buyerDocsReady = listing.documents.some((document) => document.docType === "buyer_id");

  return Boolean(
    listing.status === "sold" &&
      isSellerInfoComplete(listing) &&
      isCarInfoComplete(listing) &&
      isBuyerInfoComplete(listing) &&
      sellerDocsReady &&
      carDocsReady &&
      buyerDocsReady,
  );
}

function inferStage(listing: Listing): "seller" | "car" | "buyer" {
  if (listing.buyer?.name || listing.status === "sold") {
    return "buyer";
  }

  const docs = inferDocumentStatus(listing);
  if (docs.sellerReady || docs.carReady) {
    return "car";
  }

  return "seller";
}

function toAdminFileRecord(listing: Listing): AdminFileRecord {
  return {
    id: listing.id,
    fileNumber: listing.stockNumber,
    carName: buildAdminCarName(listing),
    numberPlate: listing.numberPlate,
    sellerName: listing.seller?.name?.trim() || "Not added yet",
    sellerPhone: listing.seller?.phone ?? null,
    buyerName: listing.buyer?.name?.trim() || null,
    buyerPhone: listing.buyer?.phone ?? null,
    status: listing.status,
    sellerType: listing.sellerType,
    updatedAt: listing.updatedAt ?? listing.createdAt,
    stage: inferStage(listing),
    documentStatus: inferDocumentStatus(listing),
    publicListingStatus: getPublicListingStatus(listing),
    isCompletedFile: isCompletedFile(listing),
    listing,
  };
}

export async function getAdminFiles(filters: {
  query?: string;
  status?: string;
  sellerType?: string;
  missing?: string;
  completed?: "only" | "exclude" | "include";
} = {}) {
  const listings = await getAdminListings({
    search: filters.query,
    status: filters.status,
    sellerType: filters.sellerType,
  });

  return listings
    .map(toAdminFileRecord)
    .filter((file) => {
      if (filters.completed === "only") {
        return file.isCompletedFile;
      }

      if (filters.completed === "include") {
        return true;
      }

      return !file.isCompletedFile;
    })
    .filter((file) => {
      if (!filters.query) {
        return true;
      }

      const query = filters.query.toLowerCase();
      const haystack = [
        file.fileNumber,
        file.numberPlate,
        file.carName,
        file.sellerName,
        file.sellerPhone ?? "",
        file.buyerName ?? "",
        file.buyerPhone ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .filter((file) => {
      if (filters.missing === "buyer") {
        return !file.documentStatus.buyerReady;
      }

      if (filters.missing === "seller") {
        return !file.documentStatus.sellerReady;
      }

      return true;
    });
}

export async function getAdminFileById(id: string) {
  const files = await getAdminFiles({ completed: "include" });
  return files.find((file) => file.id === id) ?? null;
}

export async function getDashboardSummary(): Promise<DealerDashboardSummary> {
  const allFiles = await getAdminFiles({ completed: "include" });
  const activeFiles = allFiles.filter((file) => !file.isCompletedFile);
  const completedFiles = allFiles.filter((file) => file.isCompletedFile);

  return {
    totalFiles: activeFiles.length,
    carsInStock: activeFiles.filter((file) => file.status === "available").length,
    soldCars: activeFiles.filter((file) => file.status === "sold").length,
    filesMissingBuyerDocuments: activeFiles.filter(
      (file) => !file.documentStatus.buyerReady,
    ).length,
    filesMissingSellerDocuments: activeFiles.filter(
      (file) => !file.documentStatus.sellerReady,
    ).length,
    completedFiles: completedFiles.length,
    recentFiles: [...activeFiles]
      .sort((a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
      )
      .slice(0, 6),
  };
}

export function getAdminSetupErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Admin data could not be loaded right now.";
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (!hasSupabaseEnv()) {
    return demoInquiries;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return demoInquiries;
  }

  const { data, error } = await supabase
    .from("inquiries")
    .select("id,listing_id,name,phone,email,message,created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return demoInquiries;
  }

  return data.map((inquiry) => ({
    id: inquiry.id,
    listingId: inquiry.listing_id,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    message: inquiry.message,
    createdAt: inquiry.created_at,
  }));
}
