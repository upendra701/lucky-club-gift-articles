import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { OfferForm } from "./OfferForm";
import { deleteOffer } from "./actions";

export const dynamic = "force-dynamic";

export default async function OffersPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const offers = await prisma.offerPoster.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  const params = await searchParams;
  const editing = params.edit ? offers.find((offer) => offer.id === params.edit) : undefined;
  return <main className="admin-content admin-list-page"><header className="admin-topbar"><div><p className="admin-kicker">Homepage / Offers</p><h1>Offer posters.</h1></div><Link className="admin-primary-button" href="/admin/offers">New offer <span aria-hidden="true">+</span></Link></header><div className="admin-category-layout"><OfferForm offer={editing} /><section className="admin-form-panel"><div className="admin-form-heading"><div><p className="admin-kicker">Homepage promotion</p><h2>All offers</h2></div><span className="admin-muted">{offers.length} total</span></div><div className="admin-category-list">{offers.map((offer) => <article key={offer.id}><div><strong>{offer.title}</strong><small>Order {offer.sortOrder} · {offer.active ? "Shown" : "Hidden"}</small></div><div className="admin-row-actions"><Link href={`/admin/offers?edit=${offer.id}`}>Edit</Link><form action={deleteOffer}><input type="hidden" name="id" value={offer.id} /><button type="submit">Delete</button></form></div></article>)}</div></section></div></main>;
}
