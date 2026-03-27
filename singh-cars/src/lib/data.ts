import { demoInquiries, demoListings } from "@/lib/demo-data";
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

function mapListing(row: ListingRow): Listing {
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
    images:
      row.listing_images?.map((image) => ({
        id: image.id,
        listingId: image.listing_id,
        imageUrl: image.image_url,
        sortOrder: image.sort_order,
      })) ?? [],
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
  const supabase = admin
    ? await createServerSupabaseClient()
    : await getPublicSupabase();

  if (!supabase) {
    return null;
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
    return null;
  }

  return data.map((row) => mapListing(row as ListingRow));
}

export async function getListings(filters: InventoryFilters = {}) {
  const listings = await fetchListingsFromSupabase({ filters });
  if (listings) {
    return listings;
  }

  return applyInventoryFilters(
    demoListings.filter((listing) => listing.status === "available"),
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
  const listings =
    (await fetchListingsFromSupabase({
      admin: true,
      filters: {
        search: filters.search,
      },
    })) ?? demoListings;

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
  const sellerReady = listing.documents.some((document) =>
    ["rc", "insurance", "seller_id"].includes(document.docType),
  );
  const carReady = Boolean(listing.coverImageUrl || listing.images.length);
  const buyerReady = listing.documents.some((document) =>
    ["buyer_id", "loan_noc", "other"].includes(document.docType),
  );

  return {
    sellerReady,
    carReady,
    buyerReady,
  };
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
    carName: `${listing.make} ${listing.model}${listing.variant ? ` ${listing.variant}` : ""}`,
    numberPlate: listing.numberPlate,
    sellerName: listing.seller?.name ?? "Unknown Seller",
    sellerPhone: listing.seller?.phone ?? null,
    buyerName: listing.buyer?.name ?? null,
    buyerPhone: listing.buyer?.phone ?? null,
    status: listing.status,
    sellerType: listing.sellerType,
    updatedAt: listing.updatedAt ?? listing.createdAt,
    stage: inferStage(listing),
    documentStatus: inferDocumentStatus(listing),
    listing,
  };
}

export async function getAdminFiles(filters: {
  query?: string;
  status?: string;
  sellerType?: string;
  missing?: string;
} = {}) {
  const listings = await getAdminListings({
    search: filters.query,
    status: filters.status,
    sellerType: filters.sellerType,
  });

  return listings
    .map(toAdminFileRecord)
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
  const files = await getAdminFiles();
  return files.find((file) => file.id === id) ?? null;
}

export async function getDashboardSummary(): Promise<DealerDashboardSummary> {
  const files = await getAdminFiles();

  return {
    totalFiles: files.length,
    carsInStock: files.filter((file) => file.status === "available").length,
    soldCars: files.filter((file) => file.status === "sold").length,
    filesMissingBuyerDocuments: files.filter(
      (file) => !file.documentStatus.buyerReady,
    ).length,
    filesMissingSellerDocuments: files.filter(
      (file) => !file.documentStatus.sellerReady,
    ).length,
    recentFiles: [...files]
      .sort((a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
      )
      .slice(0, 6),
  };
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
