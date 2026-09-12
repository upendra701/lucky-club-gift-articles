"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";
import { saveCategory } from "./actions";

export function CategoryForm({ category }: { category?: Category }) {
  const [error, setError] = useState("");

  return (
    <form
      action={async (formData) => {
        try {
          setError("");
          await saveCategory(formData);
        } catch (actionError) {
          if (actionError && typeof actionError === "object" && "digest" in actionError && typeof actionError.digest === "string" && actionError.digest.startsWith("NEXT_REDIRECT")) {
            throw actionError;
          }
          setError(actionError instanceof Error ? actionError.message : "Could not save category.");
        }
      }}
      className="admin-form-panel admin-category-form"
      encType="multipart/form-data"
    >
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="admin-form-heading">
        <div>
          <p className="admin-kicker">{category ? "Edit category" : "New category"}</p>
          <h2>{category ? category.name : "Add a category"}</h2>
        </div>
      </div>

      <label>
        Category name
        <input name="name" defaultValue={category?.name} required />
      </label>

      <label>
        Description
        <textarea name="description" defaultValue={category?.description ?? ""} rows={3} />
      </label>

      <label>
        Reference image
        <input name="imageFile" type="file" accept="image/*" />
        <small>Upload a category image for the homepage card. Maximum 5 MB.</small>
      </label>

      {category?.image && (
        <div className="admin-image-preview">
          <img src={category.image} alt={`${category.name} reference`} />
          <small>Current reference image</small>
        </div>
      )}

      <label>
        Category image URL
        <input name="image" type="url" defaultValue={category?.image ?? ""} placeholder="https://..." />
        <small>Optional fallback. A newly uploaded reference image takes priority.</small>
      </label>

      <div className="admin-form-grid">
        <label>
          Display order
          <input name="sortOrder" type="number" min="0" step="1" defaultValue={category?.sortOrder ?? 0} required />
          <small>Lower numbers appear first.</small>
        </label>
      </div>

      <label className="admin-check-single">
        <input name="active" type="checkbox" defaultChecked={category?.active ?? true} />
        Show on homepage
      </label>

      {error && <p className="admin-form-error" role="alert">{error}</p>}

      <button className="admin-primary-button" type="submit">
        {category ? "Save changes" : "Create category"}
      </button>
    </form>
  );
}
