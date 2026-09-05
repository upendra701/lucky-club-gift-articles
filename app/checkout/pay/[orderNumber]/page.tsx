import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { PaymentCheckout } from "./PaymentCheckout";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const order = await prisma.order.findUnique({ where: { orderNumber: (await params).orderNumber }, include: { items: true } });
  if (!order || !["PAYMENT_PENDING", "PAYMENT_FAILED"].includes(order.status)) notFound();
  return <main className="checkout-success-page payment-page"><div className="success-mark">LC</div><p className="eyebrow">Secure test-mode payment</p><h1>Complete your payment.</h1><p className="success-order-number">Order {order.orderNumber}</p><section className="success-summary"><div><span>Gift</span><strong>{order.items[0]?.productNameSnapshot}</strong></div><div><span>Amount</span><strong>₹{order.totalAmount.toString()}</strong></div><div><span>Status</span><strong className="pending-status">Payment Pending</strong></div></section><PaymentCheckout orderNumber={order.orderNumber} /><Link className="admin-return-link" href={`/checkout/success/${order.orderNumber}`}>Return to order</Link></main>;
}