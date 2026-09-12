"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { createAdminStorageClient, PRODUCT_IMAGE_BUCKET } from "../../../lib/supabase/admin";
import { booleanField, optionalText, requiredText, slugify } from "../../../lib/validation";

async function uploadCategoryReferenceImage(categoryId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Reference image must be an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Reference image must be under 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `categories/${categoryId}/${crypto.randomUUID()}.${extension}`;
  const storage = createAdminStorageClient().storage;
  const { error: uploadError } = await storage.from(PRODUCT_IMAGE_BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(`Could not upload reference image: ${uploadError.message}`);

  const { data: publicUrl } = storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(storagePath);
  return publicUrl.publicUrl;
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = optionalText(formData.get("id"));
  const name = requiredText(formData.get("name"), "Category name");
  const sortOrderText = optionalText(formData.get("sortOrder")) ?? "0";
  const sortOrder = Number(sortOrderText);
  const imageFile = formData.get("imageFile");
  const hasImageFile = imageFile instanceof File && imageFile.size > 0;

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Display order must be a whole number of 0 or higher.");
  }

  const values = {
    name,
    slug: slugify(name),
    description: optionalText(formData.get("description")),
    image: optionalText(formData.get("image")),
    sortOrder,
    active: booleanField(formData.get("active")),
  };

  if (id) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new Error("Category not found.");
    const image = hasImageFile ? await uploadCategoryReferenceImage(id, imageFile) : values.image;
    await prisma.category.update({ where: { id }, data: { ...values, image } });
  } else {
    const category = await prisma.category.create({ data: values });
    if (hasImageFile) {
      try {
        const image = await uploadCategoryReferenceImage(category.id, imageFile);
        await prisma.category.update({ where: { id: category.id }, data: { image } });
      } catch (error) {
        await prisma.category.delete({ where: { id: category.id } });
        throw error;
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = requiredText(formData.get("id"), "Category");
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount) throw new Error("Move or delete this category's products before deleting it.");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}
