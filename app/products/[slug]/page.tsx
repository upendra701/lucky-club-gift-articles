import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findFirst({ where: { slug, available: true }, include: { category: true, images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Gift not found | Lucky Club Gift Articles" };
  return { title: `${product.name} | Lucky Club Gift Articles`, description: product.description || `Discover ${product.name} from Lucky Club Gift Articles.` };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const whatsapp = `https://wa.me/917032785547?text=${encodeURIComponent(`Hi, I'm interested in customizing ${product.name}.`)}`;
  return <main className="product-detail-page"><header className="catalog-header"><Link className="catalog-brand" href="/">Lucky Club <small>Gift Articles</small></Link><nav><Link href="/products">All gifts</Link><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></nav></header><div className="product-breadcrumb"><Link href="/products">The collection</Link><span>/</span>{product.category.name}</div><section className="product-detail"><div className="product-gallery"><div className="product-gallery-main">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt || product.name} /> : <span>Lucky Club</span>}</div><div className="product-gallery-thumbs">{product.images.slice(1).map((image) => <img key={image.id} src={image.url} alt={image.alt || product.name} />)}</div></div><div className="product-detail-copy"><p className="eyebrow">{product.category.name}</p><h1>{product.name}</h1><div className="product-detail-price">₹{product.price.toString()}{product.comparePrice && <del>₹{product.comparePrice.toString()}</del>}</div><p className="product-detail-availability">Available to order</p>{product.description && <p className="product-description">{product.description}</p>}<div className="customization-note"><strong>{product.customizationEnabled ? "Personalization available" : "Made with care"}</strong>{product.customizationEnabled && product.customizationInstructions && <p>{product.customizationInstructions}</p>}</div><a className="gold-button product-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">Chat about this gift <span aria-hidden="true">↗</span></a><Link className="outline-button product-confirm-button" href={`/checkout?product=${product.slug}&quantity=1`}>Confirm My Customisation <span aria-hidden="true">↗</span></Link><p className="product-flow-note">Discuss your photos, names, message and design directly with Lucky Club on WhatsApp, then confirm your details here.</p></div></section></main>;
}