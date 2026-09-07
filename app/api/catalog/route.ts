import { NextResponse } from "next/server";
import { getCatalogProducts } from "../../../lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const products = await getCatalogProducts({
      featuredOnly: url.searchParams.get("featured") === "true",
      query: url.searchParams.get("q")?.trim() || undefined,
      categorySlug: url.searchParams.get("category")?.trim() || undefined,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Catalog API failed:", error);
    return NextResponse.json(
      { error: "Unable to load the gift collection." },
      { status: 500 },
    );
  }
}