"use client";

import { useState } from "react";
import { deleteCategory } from "./actions";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [error, setError] = useState("");
  return <form action={async (formData) => { if (!window.confirm("Delete this category? Products must be moved first.")) return; try { setError(""); await deleteCategory(formData); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not delete category."); } }}><input type="hidden" name="id" value={id} /><button className="admin-danger-link" type="submit">Delete</button>{error && <span className="admin-inline-error">{error}</span>}</form>;
}