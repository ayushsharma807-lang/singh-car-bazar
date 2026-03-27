import { redirect } from "next/navigation";

export default function LegacyNewListingRedirect() {
  redirect("/admin/files/new");
}
