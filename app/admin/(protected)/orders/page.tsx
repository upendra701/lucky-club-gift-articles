import Link from "next/link";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  CUSTOMIZATION_PENDING: "Customization pending",
  CUSTOMIZATION_CONFIRMED: "Customization confirmed",
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_SUCCESS: "Payment successful",
  PAYMENT_VERIFICATION_PENDING: "Payment verification pending",
  ORDER_CONFIRMED: "Order confirmed",
  PROCESSING: "Processing",
  READY_TO_SHIP: "Ready to ship",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PAYMENT_FAILED: "Payment failed",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true, productNameSnapshot: true, quantity: true } },
      payments: { select: { id: true, status: true, gatewayPaymentId: true, amount: true, paidAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <main className="admin-content admin-orders-page">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">Store operations</p>
          <h1>Orders</h1>
          <p className="admin-page-subtitle">Every customer order, payment and delivery detail in one place.</p>
        </div>
        <span className="admin-status"><i /> Secure session</span>
      </header>

      <section className="admin-orders-toolbar">
        <div><strong>{orders.length}</strong><span>total orders</span></div>
        <div className="admin-orders-toolbar-note">Click an order to see the complete customer, product, payment and delivery details.</div>
      </section>

      <section className="admin-panel admin-orders-panel">
        {orders.length ? (
          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const payment = order.payments[0];
                  return (
                    <tr key={order.id}>
                      <td><strong>{order.orderNumber}</strong><small>{order.customerPhone}</small></td>
                      <td>{order.customerName}</td>
                      <td><span>{order.items.length} product{order.items.length === 1 ? "" : "s"}</span><small>{order.items.map((item) => `${item.productNameSnapshot} × ${item.quantity}`).join(", ")}</small></td>
                      <td><strong>₹{order.totalAmount.toString()}</strong>{payment?.status === "SUCCESS" && <small className="admin-payment-ok">Paid</small>}</td>
                      <td><em className={`admin-status-badge status-${order.status.toLowerCase()}`}>{statusLabels[order.status] ?? order.status.replaceAll("_", " ")}</em></td>
                      <td>{order.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td><Link className="admin-view-link" href={`/admin/orders/${order.orderNumber}`}>View →</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-inline-empty admin-orders-empty"><strong>No orders yet</strong><span>New customer orders will appear here automatically.</span></div>
        )}
      </section>
    </main>
  );
}
