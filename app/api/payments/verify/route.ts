import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getRazorpayClient } from "../../../../lib/razorpay";
import { markRazorpayPaymentSuccess } from "../../../../lib/razorpay-payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      orderNumber?: unknown;
      razorpayOrderId?: unknown;
      razorpayPaymentId?: unknown;
      razorpaySignature?: unknown;
    };

    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const razorpayOrderId = typeof body.razorpayOrderId === "string" ? body.razorpayOrderId.trim() : "";
    const razorpayPaymentId = typeof body.razorpayPaymentId === "string" ? body.razorpayPaymentId.trim() : "";
    const razorpaySignature = typeof body.razorpaySignature === "string" ? body.razorpaySignature.trim() : "";

    if (!orderNumber || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Payment details are incomplete." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true, orderNumber: true, totalAmount: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id, gateway: "razorpay", gatewayOrderId: razorpayOrderId },
      select: { id: true, gatewayOrderId: true, amount: true, status: true },
    });
    if (!payment?.gatewayOrderId) {
      return NextResponse.json({ error: "This Razorpay order is not linked to the Lucky Club order." }, { status: 400 });
    }

    const { keySecret, client } = getRazorpayClient();
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${payment.gatewayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const validSignature = expected.length === razorpaySignature.length && crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(razorpaySignature, "utf8"),
    );
    if (!validSignature) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

    const razorpayPayment = await client.payments.fetch(razorpayPaymentId);
    if (razorpayPayment.order_id !== payment.gatewayOrderId) {
      return NextResponse.json({ error: "Payment order mismatch." }, { status: 400 });
    }
    if (razorpayPayment.currency !== "INR" || razorpayPayment.amount !== Math.round(order.totalAmount.toNumber() * 100)) {
      return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });
    }
    if (razorpayPayment.status !== "captured") {
      return NextResponse.json({ error: "Payment received but is not captured yet. Please wait a moment and try again." }, { status: 409 });
    }

    const result = await markRazorpayPaymentSuccess({
      gatewayOrderId: payment.gatewayOrderId,
      gatewayPaymentId: razorpayPaymentId,
      gatewaySignature: razorpaySignature,
      amountInPaise: razorpayPayment.amount,
      currency: razorpayPayment.currency,
      paidAt: new Date(),
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    return NextResponse.json({ verified: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Razorpay payment verification failed", error);
    return NextResponse.json({ error: "Unable to verify payment. Please try again." }, { status: 500 });
  }
}
