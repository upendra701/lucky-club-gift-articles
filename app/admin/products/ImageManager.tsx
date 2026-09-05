"use client";

import { useState } from "react";
import { deleteProductImage, replaceProductImage, updateProductImage, uploadProductImages } from "./actions";

type ImageRecord = { id: string; url: string; alt: string | null; sortOrder: number; isPrimary: boolean };

export function ImageManager({ productId, images }: { productId: string; images: ImageRecord[] }) {
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  return <section className="admin-form-panel admin-image-panel">
    <div className="admin-form-heading"><div><p className="admin-kicker">Product media</p><h2>Images</h2></div><span className="admin-muted">{images.length} uploaded</span></div>
    <form action={async (formData) => { try { setError(""); await uploadProductImages(formData); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not upload images."); } }} className="admin-upload-form">
      <input type="hidden" name="productId" value={productId} />
      <label className="admin-upload-drop">Add images<input name="images" type="file" accept="image/*" multiple required /></label>
      <button className="admin-secondary-button" type="submit">Upload selected</button>
    </form>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <div className="admin-image-grid">
      {images.map((image, index) => <article className="admin-image-card" key={image.id}>
        <div className="admin-image-preview"><img src={image.url} alt={image.alt || "Product image"} /><span>{image.isPrimary ? "Primary" : `Image ${index + 1}`}</span></div>
        {selected === image.id ? <form action={async (formData) => { try { setError(""); await replaceProductImage(formData); setSelected(null); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not replace image."); } }} className="admin-replace-form"><input type="hidden" name="imageId" value={image.id} /><input name="image" type="file" accept="image/*" required /><button type="submit">Replace</button><button type="button" onClick={() => setSelected(null)}>Cancel</button></form> : <div className="admin-image-actions"><form action={async (formData) => { try { setError(""); await updateProductImage(formData); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not update image."); } }}><input type="hidden" name="imageId" value={image.id} /><input name="alt" defaultValue={image.alt ?? ""} placeholder="Alt text" /><input name="sortOrder" type="number" defaultValue={image.sortOrder} aria-label="Image order" /><input type="hidden" name="isPrimary" value={image.isPrimary ? "true" : "false"} /><button type="submit">Save details</button></form><div className="admin-image-buttons"><button type="button" onClick={() => setSelected(image.id)}>Replace</button><form action={async (formData) => { if (!window.confirm("Delete this image permanently?")) return; try { setError(""); await deleteProductImage(formData); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not delete image."); } }}><input type="hidden" name="imageId" value={image.id} /><button className="admin-danger-link" type="submit">Delete</button></form><form action={async (formData) => { try { setError(""); await updateProductImage(formData); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not set primary image."); } }}><input type="hidden" name="imageId" value={image.id} /><input type="hidden" name="sortOrder" value={image.sortOrder} /><input type="hidden" name="isPrimary" value="true" /><button type="submit">Set primary</button></form></div></div>}
      </article>)}
    </div>
  </section>;
}