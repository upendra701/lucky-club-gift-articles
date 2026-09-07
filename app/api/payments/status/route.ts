import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const orderNumber = new URL(request.url).searchParams.get("orderNumber")?.trim() ?? "";
    if (!orderNumber) return NextResponse.json({ error: "Order reference is required." }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        payments: {
          where: { gateway: "razorpay" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, gatewayPaymentId: true },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const payment = order.payments[0];
    return NextResponse.json({
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      paymentStatus: payment?.status ?? "PENDING",
      paymentId: payment?.gatewayPaymentId ?? null,
      paid: payment?.status === "SUCCESS" || order.status === "PAYMENT_SUCCESS",
    });
  } catch (error) {
    console.error("Payment status lookup failed", error);
    return NextResponse.json({ error: "Unable to check payment status." }, { status: 500 });
  }
}
