"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";

declare global { interface Window { Razorpay: new (options: Record<string, unknown>) => { open: () => void }; } }

export function PaymentCheckout({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function startPayment() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/payments/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start payment.");
      if (!window.Razorpay) throw new Error("Payment checkout is still loading.");
      const checkout = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: "Lucky Club Gift Articles", description: `Payment for ${data.orderNumber}`, order_id: data.razorpayOrderId, handler: async (result: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => { const verification = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber, razorpayOrderId: result.razorpay_order_id, razorpayPaymentId: result.razorpay_payment_id, razorpaySignature: result.razorpay_signature }) }); const verified = await verification.json(); if (!verification.ok) { setError(verified.error || "Payment verification failed."); setLoading(false); return; } router.push(`/checkout/success/${orderNumber}`); }, modal: { ondismiss: () => { fetch("/api/payments/failed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber }) }); setLoading(false); } }, theme: { color: "#c99b4c" } });
      checkout.open();
    } catch (paymentError) { setError(paymentError instanceof Error ? paymentError.message : "Unable to start payment."); setLoading(false); }
  }
  return <><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" /><button className="gold-button checkout-submit" type="button" onClick={startPayment} disabled={loading}>{loading ? "Opening secure payment..." : "Pay securely with Razorpay"}</button>{error && <p className="checkout-error" role="alert">{error}</p>}</>;
}