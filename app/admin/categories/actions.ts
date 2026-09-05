"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { booleanField, optionalText, requiredText, slugify } from "../../../lib/validation";

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = optionalText(formData.get("id"));
  const name = requiredText(formData.get("name"), "Category name");
  const values = { name, slug: slugify(name), description: optionalText(formData.get("description")), image: optionalText(formData.get("image")), active: booleanField(formData.get("active")) };
  if (id) await prisma.category.update({ where: { id }, data: values });
  else await prisma.category.create({ data: values });
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
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}