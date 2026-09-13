import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await prisma.instagramPost.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 10 });
  return NextResponse.json(posts.map((post) => ({ id: post.id, title: post.title, image: post.image, postUrl: post.postUrl })));
}
