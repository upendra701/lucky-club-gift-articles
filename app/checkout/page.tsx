import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "./CheckoutForm";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ product?: string; quantity?: string }> }) {
  const params = await searchParams;
  const product = params.product ? await prisma.product.findUnique({ where: { slug: params.product }, include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 } } }) : null;
  if (!product || !product.available) notFound();
  const parsedQuantity = Number.parseInt(params.quantity || "1", 10);
  const quantity = Number.isInteger(parsedQuantity) && parsedQuantity > 0 && parsedQuantity <= 20 ? parsedQuantity : 1;
  return <main className="checkout-page"><header className="catalog-header"><Link className="catalog-brand" href="/">Lucky Club <small>Gift Articles</small></Link><nav><Link href={`/products/${product.slug}`}>Back to gift</Link></nav></header><div className="checkout-intro"><p className="eyebrow">A thoughtful next step</p><h1>Confirm your <em>customisation.</em></h1><p>Your details will be saved with this guest order. Payment will be added in the next step of the Lucky Club journey.</p></div><CheckoutForm product={{ slug: product.slug, name: product.name, price: product.price.toString(), imageUrl: product.images[0]?.url ?? null, imageAlt: product.images[0]?.alt ?? null }} quantity={quantity} /></main>;
}