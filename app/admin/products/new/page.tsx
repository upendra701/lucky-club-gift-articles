import { prisma } from "../../../../lib/prisma";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return <main className="admin-content admin-list-page"><ProductForm categories={categories} /></main>;
}