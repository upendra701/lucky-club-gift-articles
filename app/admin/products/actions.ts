"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { createAdminStorageClient, PRODUCT_IMAGE_BUCKET } from "../../../lib/supabase/admin";
import { booleanField, decimalText, optionalText, requiredText, slugify } from "../../../lib/validation";

function productValues(formData: FormData) {
  const name = requiredText(formData.get("name"), "Product name");
  const price = decimalText(formData.get("price"), "Price");
  const comparePrice = decimalText(formData.get("comparePrice"), "Compare price", true);
  if (!price) throw new Error("Price is required.");
  return {
    name,
    slug: slugify(name),
    description: optionalText(formData.get("description")),
    price,
    comparePrice,
    categoryId: requiredText(formData.get("categoryId"), "Category"),
    customizationEnabled: booleanField(formData.get("customizationEnabled")),
    customizationInstructions: optionalText(formData.get("customizationInstructions")),
    available: booleanField(formData.get("available")),
    featured: booleanField(formData.get("featured")),
  };
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = optionalText(formData.get("id"));
  const values = productValues(formData);
  const category = await prisma.category.findUnique({ where: { id: values.categoryId }, select: { id: true } });
  if (!category) throw new Error("The selected category does not exist.");

  if (id) {
    await prisma.product.update({ where: { id }, data: values });
  } else {
    await prisma.product.create({ data: values });
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

async function removeStorageObjects(images: { storageBucket: string; storagePath: string }[]) {
  if (!images.length) return;
  const storage = createAdminStorageClient().storage;
  const grouped = new Map<string, string[]>();
  for (const image of images) grouped.set(image.storageBucket, [...(grouped.get(image.storageBucket) ?? []), image.storagePath]);
  for (const [bucket, paths] of grouped) {
    const { error } = await storage.from(bucket).remove(paths);
    if (error) throw new Error(`Could not remove image files: ${error.message}`);
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = requiredText(formData.get("id"), "Product");
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) throw new Error("Product not found.");
  await removeStorageObjects(product.images);
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function deleteProductImage(formData: FormData) {
  await requireAdmin();
  const imageId = requiredText(formData.get("imageId"), "Image");
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new Error("Image not found.");
  const { error } = await createAdminStorageClient().storage.from(image.storageBucket).remove([image.storagePath]);
  if (error) throw new Error(`Could not remove image file: ${error.message}`);
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${image.productId}`);
}

export async function updateProductImage(formData: FormData) {
  await requireAdmin();
  const imageId = requiredText(formData.get("imageId"), "Image");
  const image = await prisma.productImage.findUnique({ where: { id: imageId }, select: { productId: true } });
  if (!image) throw new Error("Image not found.");
  await prisma.productImage.update({
    where: { id: imageId },
    data: { alt: optionalText(formData.get("alt")), sortOrder: Number(formData.get("sortOrder")) || 0, isPrimary: formData.get("isPrimary") === "true" },
  });
  if (formData.get("isPrimary") === "true") {
    await prisma.productImage.updateMany({ where: { productId: image.productId, id: { not: imageId } }, data: { isPrimary: false } });
  }
  revalidatePath(`/admin/products/${image.productId}`);
}

export async function uploadProductImages(formData: FormData) {
  await requireAdmin();
  const productId = requiredText(formData.get("productId"), "Product");
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { images: { orderBy: { sortOrder: "desc" }, take: 1 } } });
  if (!product) throw new Error("Product not found.");
  const storage = createAdminStorageClient().storage;
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) throw new Error("Choose at least one image.");
  const maxSortOrder = product.images[0]?.sortOrder ?? -1;
  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Images must be under 5 MB.");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await storage.from(PRODUCT_IMAGE_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(`Could not upload image: ${uploadError.message}`);
    const { data: publicUrl } = storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(storagePath);
    try {
      await prisma.productImage.create({ data: { productId, url: publicUrl.publicUrl, storageBucket: PRODUCT_IMAGE_BUCKET, storagePath, sortOrder: maxSortOrder + index + 1, isPrimary: product.images.length === 0 && index === 0, alt: file.name } });
    } catch (error) {
      await storage.from(PRODUCT_IMAGE_BUCKET).remove([storagePath]);
      throw error;
    }
  }
  revalidatePath(`/admin/products/${productId}`);
}

export async function replaceProductImage(formData: FormData) {
  await requireAdmin();
  const imageId = requiredText(formData.get("imageId"), "Image");
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a replacement image.");
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Images must be under 5 MB.");

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new Error("Image not found.");
  const storage = createAdminStorageClient().storage;
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const newPath = `${image.productId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await storage.from(image.storageBucket).upload(newPath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(`Could not upload replacement: ${uploadError.message}`);

  const { data: publicUrl } = storage.from(image.storageBucket).getPublicUrl(newPath);
  try {
    await prisma.productImage.update({ where: { id: imageId }, data: { url: publicUrl.publicUrl, storagePath: newPath, alt: file.name } });
  } catch (error) {
    await storage.from(image.storageBucket).remove([newPath]);
    throw error;
  }

  const { error: removeError } = await storage.from(image.storageBucket).remove([image.storagePath]);
  if (removeError) throw new Error(`Image updated, but the old Storage file could not be removed: ${removeError.message}`);
  revalidatePath(`/admin/products/${image.productId}`);
}