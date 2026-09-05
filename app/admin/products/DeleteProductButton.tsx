"use client";

import { useState } from "react";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ id }: { id: string }) {
  const [error, setError] = useState("");
  return <form action={async (formData) => {
    if (!window.confirm("Delete this product and all of its images?")) return;
    try { setError(""); await deleteProduct(formData); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not delete product."); }
  }}>
    <input type="hidden" name="id" value={id} />
    <button className="admin-danger-link" type="submit">Delete</button>
    {error && <span className="admin-inline-error">{error}</span>}
  </form>;
}