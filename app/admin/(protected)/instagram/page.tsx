import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { saveInstagramPost, deleteInstagramPost } from "./actions";

export const dynamic = "force-dynamic";

export default async function InstagramAdminPage() {
  const posts = await prisma.instagramPost.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return <main className="admin-content admin-list-page">
    <header className="admin-topbar"><div><p className="admin-kicker">Homepage / Instagram</p><h1>Instagram Showcase.</h1></div><Link className="admin-primary-button" href="/admin/instagram#new">Add post <span>+</span></Link></header>
    <div className="admin-category-layout">
      <form id="new" action={saveInstagramPost} className="admin-form-panel admin-category-form" encType="multipart/form-data">
        <div className="admin-form-heading"><div><p className="admin-kicker">New showcase item</p><h2>Add Instagram post</h2></div></div>
        <label>Reference image<input name="imageFile" type="file" accept="image/*" required /><small>Image shown in the homepage Instagram section. Maximum 5 MB.</small></label>
        <label>Instagram post URL<input name="postUrl" type="url" placeholder="https://www.instagram.com/p/..." required /></label>
        <label>Optional title<input name="title" placeholder="Gift moment" /></label>
        <div className="admin-form-grid"><label>Display order<input name="sortOrder" type="number" min="0" defaultValue="0" required /><small>Lower numbers appear first.</small></label></div>
        <label className="admin-check-single"><input name="active" type="checkbox" defaultChecked /> Show on homepage</label>
        <button className="admin-primary-button" type="submit">Add to homepage</button>
      </form>
      <section className="admin-form-panel">
        <div className="admin-form-heading"><div><p className="admin-kicker">Live content</p><h2>Instagram posts</h2></div><span className="admin-muted">{posts.length} total</span></div>
        <div className="admin-category-list">
          {posts.map((post) => <article key={post.id} style={{ alignItems: "flex-start" }}>
            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "16px", width: "100%" }}>
              <img src={post.image} alt={post.title || "Instagram showcase"} style={{ width: 90, height: 90, objectFit: "cover" }} />
              <form action={saveInstagramPost} encType="multipart/form-data" style={{ display: "grid", gap: 10 }}>
                <input type="hidden" name="id" value={post.id} />
                <input name="title" defaultValue={post.title ?? ""} placeholder="Title" />
                <input name="postUrl" type="url" defaultValue={post.postUrl} required />
                <input name="imageFile" type="file" accept="image/*" />
                <div className="admin-form-grid"><label>Order<input name="sortOrder" type="number" min="0" defaultValue={post.sortOrder} required /></label></div>
                <label className="admin-check-single"><input name="active" type="checkbox" defaultChecked={post.active} /> Show on homepage</label>
                <div className="admin-row-actions"><button className="admin-primary-button" type="submit">Save changes</button></div>
              </form>
              <form action={deleteInstagramPost} style={{ gridColumn: "2" }}><input type="hidden" name="id" value={post.id} /><button type="submit" className="admin-row-actions" style={{ color: "#a64a3d", background: "none", border: 0, cursor: "pointer" }}>Delete post</button></form>
            </div>
          </article>)}
          {!posts.length && <p className="admin-muted">No Instagram posts yet. Add your first reference image and post URL.</p>}
        </div>
      </section>
    </div>
  </main>;
}
