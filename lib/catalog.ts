import { prisma } from "./prisma";

export const catalogImageSelect = {
  id: true,
  url: true,
  alt: true,
  sortOrder: true,
  isPrimary: true,
} as const;

export async function getCatalogProducts(options?: { featuredOnly?: boolean; query?: string; categorySlug?: string }) {
  const products = await prisma.product.findMany({
    where: {
      available: true,
      ...(options?.featuredOnly ? { featured: true } : {}),
      ...(options?.query ? { name: { contains: options.query, mode: "insensitive" } } : {}),
      ...(options?.categorySlug ? { category: { slug: options.categorySlug, active: true } } : {}),
    },
    include: { category: true, images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], select: catalogImageSelect } },
    orderBy: { updatedAt: "desc" },
  });

  return products.map((product) => ({
    ...product,
    price: product.price.toString(),
    comparePrice: product.comparePrice?.toString() ?? null,
  }));
}

export type CatalogProduct = Awaited<ReturnType<typeof getCatalogProducts>>[number];