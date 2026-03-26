import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ListingForm } from "@/components/admin/listing-form";
import { getAdminListings } from "@/lib/data";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const listings = await getAdminListings();
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    notFound();
  }

  return (
    <AdminShell title="Edit Listing">
      <ListingForm listing={listing} />
    </AdminShell>
  );
}
