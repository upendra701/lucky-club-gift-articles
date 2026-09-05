"use client";

import { useActionState, useState } from "react";
import { createOrder } from "./actions";

type CheckoutProduct = { slug: string; name: string; price: string; imageUrl: string | null; imageAlt: string | null };

export function CheckoutForm({ product, quantity: initialQuantity }: { product: CheckoutProduct; quantity: number }) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [state, action, pending] = useActionState(createOrder, { error: null });
  const subtotal = (Number(product.price) * quantity).toFixed(2);
  return <form className="checkout-form" action={action}>
    <input type="hidden" name="productSlug" value={product.slug} />
    <input type="hidden" name="quantity" value={quantity} />
    <section className="checkout-section"><p className="eyebrow">Your details</p><h2>Where should we send it?</h2><div className="checkout-fields"><label>Full name<input name="customerName" autoComplete="name" required /></label><label>Phone number<input name="customerPhone" type="tel" autoComplete="tel" required /></label><label className="checkout-wide">Address line 1<input name="addressLine1" autoComplete="address-line1" required /></label><label className="checkout-wide">Address line 2 <span>(optional)</span><input name="addressLine2" autoComplete="address-line2" /></label><label>City<input name="city" autoComplete="address-level2" required /></label><label>State<input name="state" autoComplete="address-level1" required /></label><label>Postal code<input name="postalCode" autoComplete="postal-code" required /></label></div></section>
    <section className="checkout-section"><p className="eyebrow">Customisation</p><h2>One last connection.</h2><p className="checkout-help">Enter the reference shared during your WhatsApp conversation, if you have one.</p><label>Customisation Reference <span>(optional)</span><input name="enquiryReference" placeholder="e.g. LC-ABC123" /></label></section>
    <section className="checkout-section checkout-summary"><p className="eyebrow">Your gift</p><div className="checkout-product"><div className="checkout-product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.imageAlt || product.name} /> : <span>LC</span>}</div><div><h2>{product.name}</h2><p>₹{product.price} each</p></div><label>Qty<select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Quantity">{Array.from({ length: 20 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></div><div className="checkout-totals"><span>Subtotal <strong>₹{subtotal}</strong></span><span>Shipping <strong>₹0.00</strong></span><span className="checkout-total">Total <strong>₹{subtotal}</strong></span></div></section>
    {state.error && <p className="checkout-error" role="alert">{state.error}</p>}
    <button className="gold-button checkout-submit" type="submit" disabled={pending}>{pending ? "Preparing your order..." : "Confirm details"}</button>
  </form>;
}