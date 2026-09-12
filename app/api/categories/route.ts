import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true, image: true, description: true, sortOrder: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories API failed", error);
    return NextResponse.json({ error: "Unable to load categories." }, { status: 500 });
  }
}
