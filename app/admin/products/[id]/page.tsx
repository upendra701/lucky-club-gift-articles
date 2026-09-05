import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { ProductForm } from "../ProductForm";
import { ImageManager } from "../ImageManager";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return <main className="admin-content admin-list-page"><ProductForm categories={categories} product={{ id: product.id, slug: product.slug, name: product.name, description: product.description, price: product.price.toString(), comparePrice: product.comparePrice?.toString() ?? null, categoryId: product.categoryId, customizationEnabled: product.customizationEnabled, customizationInstructions: product.customizationInstructions, available: product.available, featured: product.featured }} /><ImageManager productId={product.id} images={product.images} /></main>;
}