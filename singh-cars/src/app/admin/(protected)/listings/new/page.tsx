import { AdminShell } from "@/components/admin/admin-shell";
import { ListingForm } from "@/components/admin/listing-form";

export default function NewListingPage() {
  return (
    <AdminShell title="Add Car Listing">
      <ListingForm />
    </AdminShell>
  );
}
