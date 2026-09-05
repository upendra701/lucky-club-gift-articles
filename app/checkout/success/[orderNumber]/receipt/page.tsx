import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const order = await prisma.order.findUnique({ where: { orderNumber: (await params).orderNumber }, include: { items: true, payments: { where: { status: "SUCCESS" }, orderBy: { createdAt: "desc" }, take: 1 } } });
  const payment = order?.payments[0];
  if (!order || !payment) notFound();
  return <main className="print-receipt"><div className="receipt-brand">Lucky Club <small>Gift Articles</small></div><p className="eyebrow">Payment receipt</p><h1>Thank you for your order.</h1><div className="receipt-meta"><span>Order {order.orderNumber}</span><span>{payment.paidAt?.toLocaleString("en-IN")}</span></div><section className="receipt-box"><div><span>Customer</span><strong>{order.customerName}</strong></div><div><span>Gift</span><strong>{order.items[0]?.productNameSnapshot}</strong></div><div><span>Payment reference</span><strong>{payment.gatewayPaymentId}</strong></div><div><span>Amount paid</span><strong>₹{payment.amount.toString()} {payment.currency}</strong></div><div><span>Status</span><strong>Payment Verification Pending</strong></div></section><p>Please share this payment confirmation with Lucky Club on WhatsApp so we can verify and process your order.</p><PrintButton /></main>;
}