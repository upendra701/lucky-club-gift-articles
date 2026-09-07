import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getRazorpayClient } from "../../../../lib/razorpay";
import { markRazorpayPaymentSuccess } from "../../../../lib/razorpay-payment";

export const dynamic = "force-dynamic";

function timingSafeHexEqual(expected: string, received: string) {
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"));
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 500 });
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (!signature || !timingSafeHexEqual(expectedSignature, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string; status?: string; created_at?: number } };
        order?: { entity?: { id?: string; amount_paid?: number; amount?: number; status?: string } };
      };
    };

    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (event === "payment.captured" && payment?.id && payment.order_id && payment.amount != null && payment.currency) {
      const result = await markRazorpayPaymentSuccess({
        gatewayOrderId: payment.order_id,
        gatewayPaymentId: payment.id,
        amountInPaise: payment.amount,
        currency: payment.currency,
        paidAt: payment.created_at ? new Date(payment.created_at * 1000) : new Date(),
      });
      if (!result.ok && result.reason !== "PAYMENT_NOT_FOUND") {
        console.error("Razorpay webhook payment update rejected", result.reason, payment.order_id, payment.id);
        return NextResponse.json({ error: "Payment validation failed." }, { status: 400 });
      }
    }

    if (event === "payment.failed" && payment?.id && payment.order_id) {
      console.warn("Razorpay payment failed", payment.order_id, payment.id);
    }

    if (event === "order.paid" && payload.payload?.order?.entity?.id) {
      const orderId = payload.payload.order.entity.id;
      const { client } = getRazorpayClient();
      const razorpayOrder = await client.orders.fetch(orderId);
      if (razorpayOrder.status === "paid") {
        const payments = await client.orders.fetchPayments(orderId);
        const capturedPayment = payments.items?.find((item) => item.status === "captured");
        if (capturedPayment?.id && capturedPayment.order_id && capturedPayment.amount != null && capturedPayment.currency) {
          await markRazorpayPaymentSuccess({
            gatewayOrderId: capturedPayment.order_id,
            gatewayPaymentId: capturedPayment.id,
            amountInPaise: Number(capturedPayment.amount),
            currency: capturedPayment.currency,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);
    return NextResponse.json({ error: "Unable to process webhook." }, { status: 500 });
  }
}
