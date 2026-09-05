"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "../actions";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: "⌂" },
  { label: "Products", href: "/admin/products", icon: "□" },
  { label: "Categories", href: "/admin/categories", icon: "◇" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-frame">
      <button className={`admin-drawer-backdrop ${open ? "is-open" : ""}`} type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-sidebar-top">
          <Link className="admin-sidebar-brand" href="/admin" onClick={() => setOpen(false)} aria-label="Lucky Club admin home">
            <span className="admin-brand-mark">LC</span>
            <span><strong>Lucky Club</strong><small>Gift Articles / Studio</small></span>
          </Link>
          <button className="admin-sidebar-close" type="button" onClick={() => setOpen(false)} aria-label="Close navigation">×</button>
        </div>
        <div className="admin-nav-label">Workspace</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return <Link className={active ? "active" : ""} href={item.href} key={item.label} onClick={() => setOpen(false)}><span className="admin-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>{active && <i aria-hidden="true" />}</Link>;
          })}
        </nav>
        <div className="admin-sidebar-note"><span className="admin-sidebar-note-dot" /> Secure workspace</div>
        <form action={signOut} className="admin-sidebar-footer"><button type="submit" className="admin-logout"><span aria-hidden="true">↪</span> Log out</button></form>
      </aside>
      <div className="admin-main-column">
        <header className="admin-mobile-header"><button className="admin-menu-button" type="button" onClick={() => setOpen(true)} aria-label="Open navigation"><span /><span /><span /></button><Link href="/admin" className="admin-mobile-title">Lucky Club <small>Admin</small></Link><span className="admin-mobile-status" aria-label="Secure session" /></header>
        {children}
      </div>
    </div>
  );
}
