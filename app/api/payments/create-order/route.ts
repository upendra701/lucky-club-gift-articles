import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { amountInPaise, getRazorpayClient } from "../../../../lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { orderNumber?: unknown };
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    if (!orderNumber) return NextResponse.json({ error: "Order reference is required." }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { orderNumber }, select: { id: true, orderNumber: true, totalAmount: true, status: true } });
    if (!order || !["PAYMENT_PENDING", "PAYMENT_FAILED"].includes(order.status)) return NextResponse.json({ error: "This order is not available for payment." }, { status: 400 });

    const existing = await prisma.payment.findFirst({ where: { orderId: order.id, gateway: "razorpay", gatewayOrderId: { not: null } }, orderBy: { createdAt: "desc" }, select: { gatewayOrderId: true, amount: true, currency: true } });
    if (existing?.gatewayOrderId) return NextResponse.json({ keyId: getRazorpayClient().keyId, razorpayOrderId: existing.gatewayOrderId, amount: amountInPaise(existing.amount), currency: existing.currency, orderNumber: order.orderNumber });

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.client.orders.create({ amount: amountInPaise(order.totalAmount), currency: "INR", receipt: order.orderNumber, notes: { luckyClubOrder: order.orderNumber } });
    await prisma.payment.create({ data: { orderId: order.id, gateway: "razorpay", gatewayOrderId: razorpayOrder.id, amount: order.totalAmount, currency: "INR", status: "PENDING" } });
    return NextResponse.json({ keyId: razorpay.keyId, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, orderNumber: order.orderNumber });
  } catch {
    return NextResponse.json({ error: "Unable to start payment." }, { status: 500 });
  }
}