export type ListingStatus = "available" | "booked" | "sold";
export type SellerType = "dealer" | "private";

export type Seller = {
  id: string;
  sellerType: SellerType;
  name: string;
  phone: string;
  address?: string | null;
  notes?: string | null;
};

export type Buyer = {
  id: string;
  listingId: string;
  name?: string | null;
  phone?: string | null;
  notes?: string | null;
  saleDate?: string | null;
  soldPrice?: number | null;
};

export type ListingImage = {
  id: string;
  listingId: string;
  imageUrl: string;
  isFeatured: boolean;
  sortOrder: number;
};

export type ListingDocument = {
  id: string;
  listingId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
};

export type Listing = {
  id: string;
  slug: string;
  stockNumber: string;
  numberPlate: string;
  make: string;
  model: string;
  variant?: string | null;
  year: number;
  registrationYear?: number | null;
  fuel: string;
  transmission: string;
  kmDriven: number;
  color?: string | null;
  ownerNumber?: number | null;
  price: number;
  location: string;
  description?: string | null;
  featured: boolean;
  status: ListingStatus;
  isPublished: boolean;
  sellerType: SellerType;
  seller: Seller;
  buyer?: Buyer | null;
  images: ListingImage[];
  documents: ListingDocument[];
  createdAt?: string;
};

export type Inquiry = {
  id: string;
  listingId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  carTitle?: string | null;
  createdAt: string;
};

export type InventoryFilters = {
  search?: string;
  brand?: string;
  fuel?: string;
  transmission?: string;
  year?: string;
  price?: string;
};
