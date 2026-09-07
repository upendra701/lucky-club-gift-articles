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
    const prismaError = error as {
      name?: string;
      code?: string;
      message?: string;
      meta?: unknown;
    };

    console.error("Catalog API failed", {
      name: prismaError?.name,
      code: prismaError?.code,
      message: prismaError?.message,
      meta: prismaError?.meta,
    });

    return NextResponse.json(
      { error: "Unable to load the gift collection." },
      { status: 500 },
    );
  }
}