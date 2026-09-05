import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { orderNumber?: unknown };
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    if (orderNumber) await prisma.order.updateMany({ where: { orderNumber, status: "PAYMENT_PENDING" }, data: { status: "PAYMENT_FAILED" } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to record payment status." }, { status: 500 });
  }
}