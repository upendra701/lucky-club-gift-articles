import Link from "next/link";
import { getCatalogProducts } from "../../lib/catalog";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const filters = await searchParams;
  const [products, categories] = await Promise.all([
    getCatalogProducts({ query: filters.q?.trim(), categorySlug: filters.category }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return <main className="catalog-page"><header className="catalog-header"><Link className="catalog-brand" href="/">Lucky Club <small>Gift Articles</small></Link><nav><Link href="/">Home</Link><a href="https://wa.me/917032785547" target="_blank" rel="noreferrer">WhatsApp</a></nav></header><section className="catalog-intro"><p className="eyebrow">The collection</p><h1>Gifts made to feel <em>personal.</em></h1><p>Explore thoughtful pieces made for the people and moments that matter most.</p></section><form className="catalog-filters" method="get"><input name="q" defaultValue={filters.q ?? ""} placeholder="Search gifts" aria-label="Search gifts" /><select name="category" defaultValue={filters.category ?? ""} aria-label="Filter by category"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select><button type="submit">Filter</button></form><section className="catalog-grid" aria-live="polite">{products.length ? products.map((product) => <article className="catalog-card" key={product.id}><Link href={`/products/${product.slug}`} className="catalog-card-image">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt || product.name} /> : <span>Lucky Club</span>}</Link><div><p className="product-category">{product.category.name}</p><h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2><p className="catalog-price">₹{product.price}{product.comparePrice && <del> ₹{product.comparePrice}</del>}</p><p className="catalog-availability">Available</p></div></article>) : <div className="catalog-empty"><h2>No gifts found.</h2><p>Try another search or explore every category.</p></div>}</section></main>;
}