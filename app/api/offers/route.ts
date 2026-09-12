import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const offers = await prisma.offerPoster.findMany({
      where: { active: true },
      select: { id: true, title: true, subtitle: true, description: true, image: true, buttonLabel: true, buttonHref: true, sortOrder: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(offers);
  } catch (error) {
    console.error("Offers API failed", error);
    return NextResponse.json({ error: "Unable to load offers." }, { status: 500 });
  }
}
