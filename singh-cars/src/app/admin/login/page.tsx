import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const setupError =
    params.reason === "config"
      ? "Admin is locked until Supabase environment variables are configured correctly."
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <AdminLoginForm setupError={setupError} />
    </div>
  );
}
