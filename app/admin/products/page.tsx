import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string }> }) {
  const filters = await searchParams;
  const query = filters.q?.trim() ?? "";
  const products = await prisma.product.findMany({
    where: {
      ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] } : {}),
      ...(filters.category ? { categoryId: filters.category } : {}),
      ...(filters.status === "available" ? { available: true } : filters.status === "unavailable" ? { available: false } : {}),
    },
    include: { category: true, images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return <main className="admin-content admin-list-page">
    <header className="admin-topbar"><div><p className="admin-kicker">Catalog / Products</p><h1>Products.</h1></div><Link className="admin-primary-button" href="/admin/products/new">Add product <span aria-hidden="true">+</span></Link></header>
    <form className="admin-filter-bar" method="get"><input name="q" defaultValue={query} placeholder="Search products" aria-label="Search products" /><select name="category" defaultValue={filters.category ?? ""} aria-label="Filter by category"><option value="">All categories</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select><select name="status" defaultValue={filters.status ?? ""} aria-label="Filter by availability"><option value="">All statuses</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select><button className="admin-secondary-button" type="submit">Filter</button></form>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Featured</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell">{product.images[0] ? <img src={product.images[0].url} alt="" /> : <span className="admin-product-placeholder">LC</span>}<div><strong>{product.name}</strong><small>/{product.slug}</small></div></div></td><td>{product.category.name}</td><td>₹{product.price.toString()}</td><td><span className={`admin-pill ${product.available ? "is-active" : ""}`}>{product.available ? "Available" : "Hidden"}</span></td><td>{product.featured ? "Yes" : "No"}</td><td>{product.updatedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td><td><div className="admin-row-actions"><Link href={`/admin/products/${product.id}`}>Edit</Link><DeleteProductButton id={product.id} /></div></td></tr>)}</tbody></table>{products.length === 0 && <div className="admin-empty-state"><h2>No products found.</h2><p>Try changing your filters or add the first product.</p></div>}</div>
  </main>;
}