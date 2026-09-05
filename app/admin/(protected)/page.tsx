import Link from "next/link";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalProducts, availableProducts, featuredProducts, totalOrders, pendingPayments, recentOrders, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { available: true } }),
    prisma.product.count({ where: { featured: true, available: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PAYMENT_PENDING", "PAYMENT_VERIFICATION_PENDING"] } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, orderNumber: true, customerName: true, totalAmount: true, status: true, createdAt: true } }),
    prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, name: true, price: true, available: true, updatedAt: true, category: { select: { name: true } } } }),
  ]);

  return <main className="admin-content admin-dashboard-page">
    <header className="admin-topbar"><div><p className="admin-kicker">Workspace overview</p><h1>Good morning.</h1><p className="admin-page-subtitle">A clear view of your Lucky Club studio.</p></div><span className="admin-status"><i /> Secure session</span></header>
    <section className="admin-welcome"><div><p className="admin-kicker">Today at Lucky Club</p><h2>Make every order feel personal.</h2><p>Your catalogue is ready for the next thoughtful gift.</p></div><span className="admin-welcome-mark">LC</span></section>
    <section className="admin-stat-grid" aria-label="Store statistics">
      <article><span className="admin-stat-label">Total products</span><strong>{totalProducts}</strong><small>In your catalogue</small></article>
      <article><span className="admin-stat-label">Available</span><strong>{availableProducts}</strong><small>Visible to customers</small></article>
      <article><span className="admin-stat-label">Featured</span><strong>{featuredProducts}</strong><small>Shown on homepage</small></article>
      <article><span className="admin-stat-label">Orders</span><strong>{totalOrders}</strong><small>{pendingPayments} payment pending</small></article>
    </section>
    <section className="admin-dashboard-grid"><div className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Latest activity</p><h2>Recent orders</h2></div><span className="admin-muted">{totalOrders} total</span></div>{recentOrders.length ? <div className="admin-activity-list">{recentOrders.map((order) => <div className="admin-activity-row" key={order.id}><span className="admin-activity-avatar">{order.customerName.slice(0, 1).toUpperCase()}</span><div><strong>{order.customerName}</strong><small>{order.orderNumber} · {order.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</small></div><span className="admin-activity-amount">₹{order.totalAmount.toString()}<em className={`admin-status-badge status-${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</em></span></div>)}</div> : <div className="admin-inline-empty"><strong>No orders yet</strong><span>New guest orders will appear here.</span></div>}</div><div className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Catalogue pulse</p><h2>Recent products</h2></div><Link href="/admin/products">View all</Link></div>{recentProducts.length ? <div className="admin-activity-list">{recentProducts.map((product) => <div className="admin-activity-row" key={product.id}><span className="admin-activity-product">{product.name.slice(0, 1)}</span><div><strong>{product.name}</strong><small>{product.category.name}</small></div><span className="admin-activity-amount">₹{product.price.toString()}<em className={`admin-status-badge ${product.available ? "status-available" : "status-hidden"}`}>{product.available ? "Available" : "Hidden"}</em></span></div>)}</div> : <div className="admin-inline-empty"><strong>No products yet</strong><span>Start by adding your first gift.</span></div>}</div></section>
    <section className="admin-quick-actions"><div><p className="admin-kicker">Quick actions</p><h2>Keep the catalogue moving.</h2></div><div><Link className="admin-primary-button" href="/admin/products/new">+ Add product</Link><Link className="admin-secondary-button" href="/admin/products">Manage products</Link><Link className="admin-secondary-button" href="/admin/categories">Manage categories</Link></div></section>
  </main>;
}