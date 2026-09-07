import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Draft", CUSTOMIZATION_PENDING: "Customization pending", CUSTOMIZATION_CONFIRMED: "Customization confirmed",
  PAYMENT_PENDING: "Payment pending", PAYMENT_SUCCESS: "Payment successful", PAYMENT_VERIFICATION_PENDING: "Payment verification pending",
  ORDER_CONFIRMED: "Order confirmed", PROCESSING: "Processing", READY_TO_SHIP: "Ready to ship", SHIPPED: "Shipped", DELIVERED: "Delivered",
  CANCELLED: "Cancelled", PAYMENT_FAILED: "Payment failed", REFUND_PENDING: "Refund pending", REFUNDED: "Refunded",
};

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: { select: { name: true } } } },
      payments: { orderBy: { createdAt: "desc" } },
      receipt: true,
      shipping: true,
      enquiry: true,
    },
  });

  if (!order) notFound();
  const payment = order.payments[0];

  return (
    <main className="admin-content admin-order-details-page">
      <header className="admin-topbar">
        <div><Link className="admin-back-link" href="/admin/orders">← Back to orders</Link><p className="admin-kicker">Order details</p><h1>{order.orderNumber}</h1><p className="admin-page-subtitle">Placed {order.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div>
        <em className={`admin-status-badge status-${order.status.toLowerCase()}`}>{statusLabels[order.status] ?? order.status.replaceAll("_", " ")}</em>
      </header>

      <section className="admin-detail-grid">
        <div className="admin-panel admin-detail-card">
          <p className="admin-kicker">Customer</p><h2>{order.customerName}</h2><a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
        </div>
        <div className="admin-panel admin-detail-card">
          <p className="admin-kicker">Delivery address</p><h2>{order.addressLine1}</h2>{order.addressLine2 && <p>{order.addressLine2}</p>}<p>{order.city}, {order.state} – {order.postalCode}</p><p>{order.country}</p>
        </div>
      </section>

      <section className="admin-panel admin-detail-section"><div className="admin-panel-heading"><div><p className="admin-kicker">What was ordered</p><h2>Products</h2></div></div><div className="admin-order-items">{order.items.map((item) => <div className="admin-order-item" key={item.id}><div><strong>{item.productNameSnapshot}</strong><small>{item.product.name} · Quantity {item.quantity}</small>{item.customizationNotes && <p>Customization: {item.customizationNotes}</p>}</div><strong>₹{item.unitPrice.toString()} × {item.quantity}</strong></div>)}</div><div className="admin-order-totals"><span>Subtotal <strong>₹{order.subtotal.toString()}</strong></span><span>Shipping <strong>₹{order.shippingAmount.toString()}</strong></span><span className="admin-order-total">Total <strong>₹{order.totalAmount.toString()}</strong></span></div></section>

      <section className="admin-detail-grid">
        <div className="admin-panel admin-detail-card"><p className="admin-kicker">Payment</p><h2>{payment?.status === "SUCCESS" ? "Payment successful ✓" : (payment?.status ?? "Not recorded")}</h2>{payment?.gateway && <p>Gateway: {payment.gateway}</p>}{payment?.gatewayPaymentId && <p>Payment reference: <strong>{payment.gatewayPaymentId}</strong></p>}{payment?.paidAt && <p>Paid: {payment.paidAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>}{payment && <p>Amount: ₹{payment.amount.toString()} {payment.currency}</p>}</div>
        <div className="admin-panel admin-detail-card"><p className="admin-kicker">Shipping</p><h2>{order.shipping?.status ?? "PENDING"}</h2>{order.shipping?.courier && <p>Courier: {order.shipping.courier}</p>}{order.shipping?.trackingNumber && <p>Tracking: <strong>{order.shipping.trackingNumber}</strong></p>}{order.shipping?.shippedAt && <p>Shipped: {order.shipping.shippedAt.toLocaleString("en-IN")}</p>}{order.shipping?.deliveredAt && <p>Delivered: {order.shipping.deliveredAt.toLocaleString("en-IN")}</p>}</div>
      </section>

      {(order.receipt || order.enquiry) && <section className="admin-detail-grid"><div className="admin-panel admin-detail-card"><p className="admin-kicker">Receipt</p>{order.receipt ? <><h2>{order.receipt.receiptNumber}</h2>{order.receipt.receiptUrl && <a href={order.receipt.receiptUrl} target="_blank" rel="noreferrer">Open receipt →</a>}</> : <p>No receipt generated yet.</p>}</div><div className="admin-panel admin-detail-card"><p className="admin-kicker">Customization enquiry</p>{order.enquiry ? <><h2>{order.enquiry.referenceCode}</h2><p>Status: {order.enquiry.status.replaceAll("_", " ")}</p>{order.enquiry.notes && <p>Notes: {order.enquiry.notes}</p>}</> : <p>No linked enquiry.</p>}</div></section>}
    </main>
  );
}
