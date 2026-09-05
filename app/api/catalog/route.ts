import { NextResponse } from "next/server";
import { getCatalogProducts } from "../../../lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const products = await getCatalogProducts({ featuredOnly: url.searchParams.get("featured") === "true" });
  return NextResponse.json(products);
}