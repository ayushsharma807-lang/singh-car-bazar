export type ListingStatus = "available" | "booked" | "sold";
export type SellerType = "dealer" | "private";

export type Seller = {
  id: string;
  listingId: string;
  name: string;
  phone: string;
  address?: string | null;
  notes?: string | null;
  sellerType: SellerType;
};

export type Buyer = {
  id: string;
  listingId: string;
  name?: string | null;
  phone?: string | null;
  notes?: string | null;
  soldPrice?: number | null;
  saleDate?: string | null;
};

export type ListingImage = {
  id: string;
  listingId: string;
  imageUrl: string;
  sortOrder: number;
};

export type ListingDocument = {
  id: string;
  listingId: string;
  docType: string;
  fileUrl: string;
  notes?: string | null;
};

export type Listing = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  stockNumber: string;
  numberPlate: string;
  make: string;
  model: string;
  variant?: string | null;
  year: number;
  fuel: string;
  transmission: string;
  kmDriven: number;
  color?: string | null;
  ownerCount?: number | null;
  price: number;
  location: string;
  description?: string | null;
  sellerType: SellerType;
  status: ListingStatus;
  featured: boolean;
  coverImageUrl?: string | null;
  images: ListingImage[];
  seller?: Seller | null;
  buyer?: Buyer | null;
  documents: ListingDocument[];
};

export type Inquiry = {
  id: string;
  listingId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  createdAt: string;
};

export type InventoryFilters = {
  search?: string;
  brand?: string;
  model?: string;
  fuel?: string;
  transmission?: string;
  year?: string;
  price?: string;
};

export type FileWorkflowStage = "seller" | "car" | "buyer";

export type FileDocumentStatus = {
  sellerReady: boolean;
  carReady: boolean;
  buyerReady: boolean;
};

export type PublicListingStatus = {
  ready: boolean;
  missing: string[];
};

export type AdminFileRecord = {
  id: string;
  fileNumber: string;
  carName: string;
  numberPlate: string;
  sellerName: string;
  sellerPhone?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  status: ListingStatus;
  sellerType: SellerType;
  updatedAt?: string;
  stage: FileWorkflowStage;
  documentStatus: FileDocumentStatus;
  publicListingStatus: PublicListingStatus;
  listing: Listing;
};

export type DealerDashboardSummary = {
  totalFiles: number;
  carsInStock: number;
  soldCars: number;
  filesMissingBuyerDocuments: number;
  filesMissingSellerDocuments: number;
  recentFiles: AdminFileRecord[];
};
