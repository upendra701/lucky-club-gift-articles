"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type RazorpayResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = { error?: { description?: string; reason?: string } };

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export function PaymentCheckout({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recoveryTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopRecovery() {
    if (recoveryTimer.current) {
      clearInterval(recoveryTimer.current);
      recoveryTimer.current = null;
    }
  }

  function recoverPayment() {
    stopRecovery();
    let attempts = 0;
    recoveryTimer.current = setInterval(async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/payments/status?orderNumber=${encodeURIComponent(orderNumber)}`, { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.paid) {
          stopRecovery();
          router.push(`/checkout/success/${orderNumber}`);
          return;
        }
      } catch {
        // Keep retrying briefly; the webhook may arrive after the checkout closes.
      }
      if (attempts >= 10) {
        stopRecovery();
        setLoading(false);
        setError("We are still waiting for payment confirmation. If your bank account was charged, please do not pay again—contact Lucky Club with your payment reference.");
      }
    }, 1500);
  }

  async function startPayment() {
    setLoading(true);
    setError("");
    stopRecovery();
    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start payment.");
      if (!window.Razorpay) throw new Error("Payment checkout is still loading.");

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Lucky Club Gift Articles",
        description: `Payment for ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        handler: async (result: RazorpayResult) => {
          try {
            const verification = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderNumber,
                razorpayOrderId: result.razorpay_order_id,
                razorpayPaymentId: result.razorpay_payment_id,
                razorpaySignature: result.razorpay_signature,
              }),
            });
            const verified = await verification.json();
            if (!verification.ok) {
              recoverPayment();
              setError(verified.error || "Payment confirmation is taking a little longer. Checking again automatically...");
              return;
            }
            stopRecovery();
            setLoading(false);
            router.push(`/checkout/success/${orderNumber}`);
          } catch {
            recoverPayment();
            setError("Payment was received. We are checking for confirmation automatically...");
          }
        },
        modal: {
          ondismiss: () => {
            recoverPayment();
          },
        },
        theme: { color: "#c99b4c" },
      });

      checkout.open();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Unable to start payment.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <button className="gold-button checkout-submit" type="button" onClick={startPayment} disabled={loading}>
        {loading ? "Confirming payment..." : "Pay securely with Razorpay"}
      </button>
      {error && <p className="checkout-error" role="alert">{error}</p>}
    </>
  );
}
