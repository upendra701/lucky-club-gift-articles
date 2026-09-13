"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";
import { createAdminStorageClient, PRODUCT_IMAGE_BUCKET } from "../../../../lib/supabase/admin";
import { booleanField, optionalText, requiredText } from "../../../../lib/validation";

async function uploadImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Instagram image must be an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Instagram image must be under 5 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `instagram/${crypto.randomUUID()}.${extension}`;
  const storage = createAdminStorageClient().storage;
  const { error } = await storage.from(PRODUCT_IMAGE_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Could not upload Instagram image: ${error.message}`);
  return storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function saveInstagramPost(formData: FormData) {
  await requireAdmin();
  const id = optionalText(formData.get("id"));
  const postUrl = requiredText(formData.get("postUrl"), "Instagram post URL");
  if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(postUrl)) throw new Error("Enter a valid Instagram post URL.");
  const title = optionalText(formData.get("title"));
  const sortOrder = Number(optionalText(formData.get("sortOrder")) ?? "0");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("Display order must be a whole number of 0 or higher.");
  const imageFile = formData.get("imageFile");
  const hasFile = imageFile instanceof File && imageFile.size > 0;

  if (id) {
    const existing = await prisma.instagramPost.findUnique({ where: { id } });
    if (!existing) throw new Error("Instagram post not found.");
    const image = hasFile ? await uploadImage(imageFile) : existing.image;
    await prisma.instagramPost.update({ where: { id }, data: { title, postUrl, image, sortOrder, active: booleanField(formData.get("active")) } });
  } else {
    if (!hasFile) throw new Error("Choose a reference image.");
    const image = await uploadImage(imageFile);
    try { await prisma.instagramPost.create({ data: { title, postUrl, image, sortOrder, active: booleanField(formData.get("active")) } }); }
    catch (error) { throw error; }
  }
  revalidatePath("/");
  revalidatePath("/admin/instagram");
  redirect("/admin/instagram");
}

export async function deleteInstagramPost(formData: FormData) {
  await requireAdmin();
  const id = requiredText(formData.get("id"), "Instagram post");
  const existing = await prisma.instagramPost.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.instagramPost.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/instagram");
}
