import { createClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGE_BUCKET = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || "product-images";

export function createAdminStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url && !serviceRoleKey) {
    throw new Error(
      "Supabase server configuration is missing both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!url) {
    throw new Error("Supabase server configuration is missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error("Supabase server configuration is missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
