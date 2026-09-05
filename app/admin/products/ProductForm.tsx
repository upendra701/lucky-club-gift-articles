"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@prisma/client";
import { saveProduct } from "./actions";

type ProductWithValues = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  categoryId: string;
  customizationEnabled: boolean;
  customizationInstructions: string | null;
  available: boolean;
  featured: boolean;
};

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductWithValues;
}) {
  const [error, setError] = useState("");

  return (
    <form
      action={async (formData) => {
        try {
          setError("");
          await saveProduct(formData);
        } catch (actionError) {
          // Next.js throws an internal redirect error after
          // a successful server-side redirect. It must not
          // be displayed as a form error.
          if (
            actionError &&
            typeof actionError === "object" &&
            "digest" in actionError &&
            typeof actionError.digest === "string" &&
            actionError.digest.startsWith("NEXT_REDIRECT")
          ) {
            throw actionError;
          }

          setError(
            actionError instanceof Error
              ? actionError.message
              : "Could not save product.",
          );
        }
      }}
      className="admin-form-panel"
    >
      {product && (
        <input
          type="hidden"
          name="id"
          value={product.id}
        />
      )}

      <div className="admin-form-heading">
        <div>
          <p className="admin-kicker">
            {product ? "Edit product" : "New product"}
          </p>

          <h2>
            {product
              ? product.name
              : "Add a product"}
          </h2>

          <p className="admin-form-meta">
            {product
              ? `/${product.slug}`
              : "Your product slug is generated from its name."}
          </p>
        </div>

        <Link
          className="admin-text-link"
          href="/admin/products"
        >
          Back to products
        </Link>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading">
          <span>01</span>

          <div>
            <h3>Basic information</h3>
            <p>
              The details customers will see first.
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <label>
            Product name
            <input
              name="name"
              defaultValue={product?.name}
              required
            />
          </label>

          <label>
            Category
            <select
              name="categoryId"
              defaultValue={
                product?.categoryId ?? ""
              }
              required
            >
              <option value="">
                Select a category
              </option>

              {categories.map((category) => (
                <option
                  value={category.id}
                  key={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field-wide">
            Description
            <textarea
              name="description"
              defaultValue={
                product?.description ?? ""
              }
              rows={4}
            />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading">
          <span>02</span>

          <div>
            <h3>Pricing</h3>
            <p>
              Use a compare price to show a
              customer saving.
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <label>
            Price (INR)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                product?.price?.toString() ?? ""
              }
              required
            />
          </label>

          <label>
            Compare price (INR)
            <input
              name="comparePrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                product?.comparePrice?.toString() ??
                ""
              }
            />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading">
          <span>03</span>

          <div>
            <h3>Customisation</h3>
            <p>
              Make the WhatsApp conversation more
              useful.
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field-wide">
            Customization instructions
            <textarea
              name="customizationInstructions"
              defaultValue={
                product?.customizationInstructions ??
                ""
              }
              rows={3}
            />
          </label>
        </div>

        <div className="admin-check-grid">
          <label>
            <input
              name="customizationEnabled"
              type="checkbox"
              defaultChecked={
                product?.customizationEnabled ??
                false
              }
            />
            Customization available
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading">
          <span>04</span>

          <div>
            <h3>Store settings</h3>
            <p>
              Control where this product appears.
            </p>
          </div>
        </div>

        <div className="admin-check-grid">
          <label>
            <input
              name="available"
              type="checkbox"
              defaultChecked={
                product?.available ?? true
              }
            />
            Available to sell
          </label>

          <label>
            <input
              name="featured"
              type="checkbox"
              defaultChecked={
                product?.featured ?? false
              }
            />
            Featured product
          </label>
        </div>
      </div>

      {error && (
        <p
          className="admin-form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        className="admin-primary-button"
        type="submit"
      >
        {product
          ? "Save changes"
          : "Create product"}
      </button>
    </form>
  );
}