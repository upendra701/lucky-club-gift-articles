"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";
import { saveCategory } from "./actions";

export function CategoryForm({ category }: { category?: Category }) {
  const [error, setError] = useState("");
  return <form action={async (formData) => { try { setError(""); await saveCategory(formData); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not save category."); } }} className="admin-form-panel admin-category-form">
    {category && <input type="hidden" name="id" value={category.id} />}
    <div className="admin-form-heading"><div><p className="admin-kicker">{category ? "Edit category" : "New category"}</p><h2>{category ? category.name : "Add a category"}</h2></div></div>
    <label>Category name<input name="name" defaultValue={category?.name} required /></label>
    <label>Description<textarea name="description" defaultValue={category?.description ?? ""} rows={3} /></label>
    <label>Image URL<input name="image" type="url" defaultValue={category?.image ?? ""} /></label>
    <label className="admin-check-single"><input name="active" type="checkbox" defaultChecked={category?.active ?? true} /> Active category</label>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <button className="admin-primary-button" type="submit">{category ? "Save changes" : "Create category"}</button>
  </form>;
}