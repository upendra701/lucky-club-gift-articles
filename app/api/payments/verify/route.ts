import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { amountInPaise, getRazorpayClient } from "../../../../lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { orderNumber?: unknown; razorpayOrderId?: unknown; razorpayPaymentId?: unknown; razorpaySignature?: unknown };
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const razorpayOrderId = typeof body.razorpayOrderId === "string" ? body.razorpayOrderId.trim() : "";
    const razorpayPaymentId = typeof body.razorpayPaymentId === "string" ? body.razorpayPaymentId.trim() : "";
    const razorpaySignature = typeof body.razorpaySignature === "string" ? body.razorpaySignature.trim() : "";
    if (!orderNumber || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return NextResponse.json({ error: "Payment details are incomplete." }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { orderNumber }, select: { id: true, orderNumber: true, totalAmount: true, status: true } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const existing = await prisma.payment.findFirst({ where: { gatewayPaymentId: razorpayPaymentId, orderId: order.id }, select: { id: true } });
    if (existing) return NextResponse.json({ verified: true, orderNumber });

    const { keySecret } = getRazorpayClient();
    const expected = crypto.createHmac("sha256", keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
    const validSignature = expected.length === razorpaySignature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpaySignature));
    if (!validSignature) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

    const payment = await prisma.payment.findFirst({ where: { orderId: order.id, gateway: "razorpay", gatewayOrderId: razorpayOrderId }, select: { id: true, amount: true, status: true } });
    if (!payment) return NextResponse.json({ error: "This Razorpay order is not linked to the Lucky Club order." }, { status: 400 });
    if (payment?.status === "SUCCESS") return NextResponse.json({ verified: true, orderNumber });
    if (amountInPaise(payment.amount) !== amountInPaise(order.totalAmount)) return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });

    await prisma.$transaction(async (transaction) => {
      await transaction.payment.update({ where: { id: payment.id }, data: { gatewayPaymentId: razorpayPaymentId, gatewaySignature: razorpaySignature, amount: order.totalAmount, currency: "INR", status: "SUCCESS", paidAt: new Date() } });
      await transaction.order.update({ where: { id: order.id }, data: { status: "PAYMENT_SUCCESS" } });
      await transaction.order.update({ where: { id: order.id }, data: { status: "PAYMENT_VERIFICATION_PENDING" } });
    });
    return NextResponse.json({ verified: true, orderNumber });
  } catch {
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}