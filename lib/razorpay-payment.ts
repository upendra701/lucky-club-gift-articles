import { prisma } from "./prisma";

export async function markRazorpayPaymentSuccess({
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  amountInPaise: receivedAmountInPaise,
  currency,
  paidAt = new Date(),
}: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
  amountInPaise: number;
  currency: string;
  paidAt?: Date;
}) {
  const payment = await prisma.payment.findFirst({
    where: {
      gateway: "razorpay",
      gatewayOrderId,
    },
    select: {
      id: true,
      orderId: true,
      amount: true,
      currency: true,
      status: true,
      order: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
        },
      },
    },
  });

  if (!payment) return { ok: false as const, reason: "PAYMENT_NOT_FOUND" as const };

  const expectedAmountInPaise = Math.round(payment.amount.toNumber() * 100);
  const expectedOrderAmountInPaise = Math.round(payment.order.totalAmount.toNumber() * 100);

  if (receivedAmountInPaise !== expectedAmountInPaise || receivedAmountInPaise !== expectedOrderAmountInPaise) {
    return { ok: false as const, reason: "AMOUNT_MISMATCH" as const };
  }

  if (currency !== "INR" || payment.currency !== "INR") {
    return { ok: false as const, reason: "CURRENCY_MISMATCH" as const };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.payment.update({
      where: { id: payment.id },
      data: {
        gatewayPaymentId,
        ...(gatewaySignature ? { gatewaySignature } : {}),
        status: "SUCCESS",
        paidAt: payment.status === "SUCCESS" && payment.gatewayPaymentId ? undefined : paidAt,
      },
    });

    if (["PAYMENT_PENDING", "PAYMENT_FAILED", "PAYMENT_VERIFICATION_PENDING", "PAYMENT_SUCCESS"].includes(payment.order.status)) {
      await transaction.order.update({
        where: { id: payment.orderId },
        data: { status: "PAYMENT_SUCCESS" },
      });
    }
  });

  return { ok: true as const, orderId: payment.orderId };
}
