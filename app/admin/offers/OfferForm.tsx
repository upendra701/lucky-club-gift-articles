"use client";

import { useState } from "react";
import { saveOffer } from "./actions";

type Offer = { id: string; title: string; subtitle: string | null; description: string | null; image: string; buttonLabel: string | null; buttonHref: string | null; sortOrder: number; active: boolean };

export function OfferForm({ offer }: { offer?: Offer }) {
  const [error, setError] = useState("");
  return <form action={async (formData) => { try { setError(""); await saveOffer(formData); } catch (actionError) { if (actionError && typeof actionError === "object" && "digest" in actionError && typeof actionError.digest === "string" && actionError.digest.startsWith("NEXT_REDIRECT")) throw actionError; setError(actionError instanceof Error ? actionError.message : "Could not save offer poster."); } }} className="admin-form-panel">
    {offer && <input type="hidden" name="id" value={offer.id} />}
    <div className="admin-form-heading"><div><p className="admin-kicker">{offer ? "Edit offer" : "New offer"}</p><h2>{offer ? offer.title : "Add an offer poster"}</h2></div></div>
    <label>Offer title<input name="title" defaultValue={offer?.title} placeholder="Festive Sale — Up to 30% Off" required /></label>
    <label>Short headline<input name="subtitle" defaultValue={offer?.subtitle ?? ""} placeholder="Made for meaningful moments" /></label>
    <label>Description<textarea name="description" defaultValue={offer?.description ?? ""} rows={3} placeholder="Limited-time offer details..." /></label>
    <label>Offer poster image<input name="imageFile" type="file" accept="image/*" /><small>Upload the poster you want customers to see. Maximum 8 MB.</small></label>
    {offer?.image && <><input type="hidden" name="image" value={offer.image} /><img src={offer.image} alt={offer.title} style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 12 }} /></>}
    <div className="admin-form-grid"><label>Button text<input name="buttonLabel" defaultValue={offer?.buttonLabel ?? "Shop Offer"} placeholder="Shop Offer" /></label><label>Button link<input name="buttonHref" type="url" defaultValue={offer?.buttonHref ?? ""} placeholder="https://... or /products" /></label></div>
    <div className="admin-form-grid"><label>Display order<input name="sortOrder" type="number" min="0" step="1" defaultValue={offer?.sortOrder ?? 0} required /><small>Lower numbers appear first.</small></label></div>
    <label className="admin-check-single"><input name="active" type="checkbox" defaultChecked={offer?.active ?? true} /> Show this offer on the homepage</label>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <button className="admin-primary-button" type="submit">{offer ? "Save changes" : "Publish offer"}</button>
  </form>;
}
