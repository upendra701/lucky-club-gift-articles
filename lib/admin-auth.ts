import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.app_metadata?.role;
  const isAdmin = user && (role === "admin" || role === "ADMIN" || user.app_metadata?.is_admin === true);

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return user;
}