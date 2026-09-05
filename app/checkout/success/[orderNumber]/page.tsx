import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const order = await prisma.order.findUnique({ where: { orderNumber: (await params).orderNumber }, include: { items: true, payments: { where: { status: "SUCCESS" }, orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!order) notFound();
  const payment = order.payments[0];
  const whatsapp = `https://wa.me/917032785547?text=${encodeURIComponent(`Hi Lucky Club, my order is ${order.orderNumber}${payment?.gatewayPaymentId ? ` and payment reference is ${payment.gatewayPaymentId}` : ""}. I am sharing my payment confirmation.`)}`;
  return <main className="checkout-success-page"><div className="success-mark">LC</div><p className="eyebrow">{payment ? "Payment successful" : "Order prepared"}</p><h1>{payment ? "Thank you, payment received." : `Thank you, ${order.customerName.split(" ")[0]}.`}</h1><p className="success-order-number">Order {order.orderNumber}</p><section className="success-summary"><div><span>Gift</span><strong>{order.items[0]?.productNameSnapshot}</strong></div><div><span>Amount paid</span><strong>₹{(payment?.amount ?? order.totalAmount).toString()}</strong></div><div><span>Payment status</span><strong className="pending-status">{payment ? "Payment Verification Pending" : "Payment Pending"}</strong></div>{payment && <div><span>Payment reference</span><strong>{payment.gatewayPaymentId}</strong></div>} {payment && <div><span>Paid at</span><strong>{payment.paidAt?.toLocaleString("en-IN")}</strong></div>}</section><p className="success-next-step">{payment ? "Please share your payment confirmation/receipt with Lucky Club on WhatsApp so we can verify and process your order." : "Online payment is pending for this order."}</p>{payment && <div className="success-actions"><a className="gold-button" href={whatsapp} target="_blank" rel="noreferrer">Share on WhatsApp <span aria-hidden="true">↗</span></a><Link className="outline-button success-receipt-link" href={`/checkout/success/${order.orderNumber}/receipt`}>Print receipt</Link></div>}<Link className="admin-return-link" href="/products">Continue browsing</Link></main>;
}