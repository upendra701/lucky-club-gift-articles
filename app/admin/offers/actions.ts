"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { createAdminStorageClient, PRODUCT_IMAGE_BUCKET } from "../../../lib/supabase/admin";
import { booleanField, optionalText, requiredText } from "../../../lib/validation";

async function uploadOfferImage(offerId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Offer poster must be an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Offer poster must be under 8 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `offers/${offerId}/${crypto.randomUUID()}.${extension}`;
  const storage = createAdminStorageClient().storage;
  const { error } = await storage.from(PRODUCT_IMAGE_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Could not upload offer poster: ${error.message}`);
  return storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function saveOffer(formData: FormData) {
  await requireAdmin();
  const id = optionalText(formData.get("id"));
  const title = requiredText(formData.get("title"), "Offer title");
  const sortOrderText = optionalText(formData.get("sortOrder")) ?? "0";
  const sortOrder = Number(sortOrderText);
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("Display order must be a whole number of 0 or higher.");
  const imageFile = formData.get("imageFile");
  const hasImageFile = imageFile instanceof File && imageFile.size > 0;
  const existingImage = optionalText(formData.get("image"));
  if (!id && !hasImageFile && !existingImage) throw new Error("Choose an offer poster image.");

  const values = {
    title,
    subtitle: optionalText(formData.get("subtitle")),
    description: optionalText(formData.get("description")),
    image: existingImage ?? "",
    buttonLabel: optionalText(formData.get("buttonLabel")),
    buttonHref: optionalText(formData.get("buttonHref")),
    sortOrder,
    active: booleanField(formData.get("active")),
  };

  if (id) {
    const existing = await prisma.offerPoster.findUnique({ where: { id } });
    if (!existing) throw new Error("Offer poster not found.");
    let image = existing.image;
    if (hasImageFile) image = await uploadOfferImage(id, imageFile);
    await prisma.offerPoster.update({ where: { id }, data: { ...values, image } });
  } else {
    const offer = await prisma.offerPoster.create({ data: values });
    if (hasImageFile) {
      try {
        const image = await uploadOfferImage(offer.id, imageFile);
        await prisma.offerPoster.update({ where: { id: offer.id }, data: { image } });
      } catch (error) {
        await prisma.offerPoster.delete({ where: { id: offer.id } });
        throw error;
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/offers");
  redirect("/admin/offers");
}

export async function deleteOffer(formData: FormData) {
  await requireAdmin();
  const id = requiredText(formData.get("id"), "Offer poster");
  await prisma.offerPoster.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/offers");
}
