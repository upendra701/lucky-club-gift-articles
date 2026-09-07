"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  price: string;
  comparePrice: string | null;
  category: { id: string; name: string; slug: string };
  images: { url: string; alt: string | null }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load the gift collection.");
        return response.json() as Promise<CatalogProduct[]>;
      })
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Unable to load the gift collection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const unique = new Map<string, { id: string; name: string; slug: string }>();
    products.forEach((product) => unique.set(product.category.id, product.category));
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !normalizedQuery || product.name.toLowerCase().includes(normalizedQuery);
      const matchesCategory = !category || product.category.slug === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  return <main className="catalog-page"><header className="catalog-header"><Link className="catalog-brand" href="/">Lucky Club <small>Gift Articles</small></Link><nav><Link href="/">Home</Link><a href="https://wa.me/917032785547" target="_blank" rel="noreferrer">WhatsApp</a></nav></header><section className="catalog-intro"><p className="eyebrow">The collection</p><h1>Gifts made to feel <em>personal.</em></h1><p>Explore thoughtful pieces made for the people and moments that matter most.</p></section><div className="catalog-filters"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search gifts" aria-label="Search gifts" /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select><button type="button" onClick={() => { setQuery(""); setCategory(""); }}>Clear</button></div><section className="catalog-grid" aria-live="polite">{loading ? <div className="catalog-empty"><h2>Loading gifts...</h2><p>One moment while we bring the collection together.</p></div> : error ? <div className="catalog-empty"><h2>We couldn&apos;t load the gifts.</h2><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div> : filteredProducts.length ? filteredProducts.map((product) => <article className="catalog-card" key={product.id}><Link href={`/products/${product.slug}`} className="catalog-card-image">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt || product.name} /> : <span>Lucky Club</span>}</Link><div><p className="product-category">{product.category.name}</p><h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2><p className="catalog-price">₹{product.price}{product.comparePrice && <del> ₹{product.comparePrice}</del>}</p><p className="catalog-availability">Available</p></div></article>) : <div className="catalog-empty"><h2>No gifts found.</h2><p>Try another search or clear the filters.</p></div>}</section></main>;
}
