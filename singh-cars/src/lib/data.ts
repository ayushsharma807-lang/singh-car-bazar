import { demoInquiries, demoListings } from "@/lib/demo-data";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Inquiry, InventoryFilters, Listing } from "@/types";

type ListingRow = {
  id: string;
  slug: string;
  stock_number: string;
  number_plate: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  registration_year: number | null;
  fuel: string;
  transmission: string;
  km_driven: number;
  color: string | null;
  owner_number: number | null;
  price: number;
  location: string;
  description: string | null;
  featured: boolean;
  status: "available" | "booked" | "sold";
  is_published: boolean;
  seller_type: "dealer" | "private";
  created_at: string;
  sellers:
    | {
        id: string;
        seller_type: "dealer" | "private";
        name: string;
        phone: string;
        address: string | null;
        notes: string | null;
      }[]
    | null;
  buyers:
    | {
        id: string;
        listing_id: string;
        name: string | null;
        phone: string | null;
        notes: string | null;
        sale_date: string | null;
        sold_price: number | null;
      }[]
    | null;
  listing_images:
    | {
        id: string;
        listing_id: string;
        image_url: string;
        is_featured: boolean;
        sort_order: number;
      }[]
    | null;
  listing_documents:
    | {
        id: string;
        listing_id: string;
        document_type: string;
        file_name: string;
        file_url: string;
      }[]
    | null;
};

function mapListing(row: ListingRow): Listing {
  const seller = row.sellers?.[0];

  return {
    id: row.id,
    slug: row.slug,
    stockNumber: row.stock_number,
    numberPlate: row.number_plate,
    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    registrationYear: row.registration_year,
    fuel: row.fuel,
    transmission: row.transmission,
    kmDriven: row.km_driven,
    color: row.color,
    ownerNumber: row.owner_number,
    price: row.price,
    location: row.location,
    description: row.description,
    featured: row.featured,
    status: row.status,
    isPublished: row.is_published,
    sellerType: row.seller_type,
    seller: seller
      ? {
          id: seller.id,
          sellerType: seller.seller_type,
          name: seller.name,
          phone: seller.phone,
          address: seller.address,
          notes: seller.notes,
        }
      : {
          id: "unknown",
          sellerType: row.seller_type,
          name: "Unknown Seller",
          phone: "",
          address: null,
          notes: null,
        },
    buyer: row.buyers?.[0]
      ? {
          id: row.buyers[0].id,
          listingId: row.buyers[0].listing_id,
          name: row.buyers[0].name,
          phone: row.buyers[0].phone,
          notes: row.buyers[0].notes,
          saleDate: row.buyers[0].sale_date,
          soldPrice: row.buyers[0].sold_price,
        }
      : null,
    images:
      row.listing_images?.map((image) => ({
        id: image.id,
        listingId: image.listing_id,
        imageUrl: image.image_url,
        isFeatured: image.is_featured,
        sortOrder: image.sort_order,
      })) ?? [],
    documents:
      row.listing_documents?.map((document) => ({
        id: document.id,
        listingId: document.listing_id,
        documentType: document.document_type,
        fileName: document.file_name,
        fileUrl: document.file_url,
      })) ?? [],
    createdAt: row.created_at,
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

export async function getListings(filters: InventoryFilters = {}) {
  if (!hasSupabaseAdminEnv()) {
    return applyInventoryFilters(
      demoListings.filter((listing) => listing.isPublished),
      filters,
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return applyInventoryFilters(
      demoListings.filter((listing) => listing.isPublished),
      filters,
    );
  }

  let query = supabase
    .from("listings")
    .select(
      "id,slug,stock_number,number_plate,make,model,variant,year,registration_year,fuel,transmission,km_driven,color,owner_number,price,location,description,featured,status,is_published,seller_type,created_at,sellers(id,seller_type,name,phone,address,notes),buyers(id,listing_id,name,phone,notes,sale_date,sold_price),listing_images(id,listing_id,image_url,is_featured,sort_order),listing_documents(id,listing_id,document_type,file_name,file_url)",
    )
    .eq("is_published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

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
    return applyInventoryFilters(
      demoListings.filter((listing) => listing.isPublished),
      filters,
    );
  }

  return data.map((row) => mapListing(row as ListingRow));
}

export async function getFeaturedListings(limit = 3) {
  const listings = await getListings();
  return listings.filter((listing) => listing.featured).slice(0, limit);
}

export async function getListingBySlug(slug: string) {
  const listings = await getListings();
  return listings.find((listing) => listing.slug === slug) ?? null;
}

export async function getAdminListings(filters: {
  search?: string;
  status?: string;
  sellerType?: string;
} = {}) {
  const listings = hasSupabaseAdminEnv() ? await getListings() : demoListings;

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

export async function getDashboardSummary() {
  const listings = hasSupabaseAdminEnv() ? await getListings() : demoListings;
  const inquiries = await getInquiries();

  return {
    totalCars: listings.length,
    availableCars: listings.filter((listing) => listing.status === "available")
      .length,
    soldCars: listings.filter((listing) => listing.status === "sold").length,
    recentInquiries: inquiries.slice(0, 5),
  };
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (!hasSupabaseAdminEnv()) {
    return demoInquiries;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return demoInquiries;
  }

  const { data, error } = await supabase
    .from("inquiries")
    .select("id,listing_id,name,phone,email,message,car_title,created_at")
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
    carTitle: inquiry.car_title,
    createdAt: inquiry.created_at,
  }));
}
