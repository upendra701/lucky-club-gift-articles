import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
  const editing = await searchParams;
  const category = editing.edit ? categories.find((item) => item.id === editing.edit) : undefined;
  return <main className="admin-content admin-list-page"><header className="admin-topbar"><div><p className="admin-kicker">Catalog / Categories</p><h1>Categories.</h1></div><Link className="admin-primary-button" href="/admin/categories">New category <span aria-hidden="true">+</span></Link></header><div className="admin-category-layout"><CategoryForm category={category} /><section className="admin-form-panel"><div className="admin-form-heading"><div><p className="admin-kicker">Collection structure</p><h2>All categories</h2></div><span className="admin-muted">{categories.length} total</span></div><div className="admin-category-list">{categories.map((item) => <article key={item.id}><div><strong>{item.name}</strong><small>{item._count.products} products · {item.active ? "Active" : "Inactive"}</small></div><div className="admin-row-actions"><Link href={`/admin/categories?edit=${item.id}`}>Edit</Link><DeleteCategoryButton id={item.id} /></div></article>)}</div></section></div></main>;
}