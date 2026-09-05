"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";

type CheckoutState = { error: string | null };
const initialState: CheckoutState = { error: null };

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createOrder(_previousState: CheckoutState = initialState, formData: FormData): Promise<CheckoutState> {
  void _previousState;
  const productSlug = text(formData.get("productSlug"));
  const customerName = text(formData.get("customerName"));
  const customerPhone = text(formData.get("customerPhone"));
  const addressLine1 = text(formData.get("addressLine1"));
  const addressLine2 = text(formData.get("addressLine2")) || null;
  const city = text(formData.get("city"));
  const state = text(formData.get("state"));
  const postalCode = text(formData.get("postalCode"));
  const enquiryReference = text(formData.get("enquiryReference")) || null;
  const quantity = Number.parseInt(text(formData.get("quantity")), 10);

  if (!productSlug || !customerName || !customerPhone || !addressLine1 || !city || !state || !postalCode) return { error: "Please complete all required delivery details." };
  if (!/^[+\d][\d\s()\-]{7,19}$/.test(customerPhone)) return { error: "Enter a valid phone number." };
  if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(postalCode)) return { error: "Enter a valid postal code." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return { error: "Choose a quantity between 1 and 20." };

  let orderNumber: string;
  try {
    const product = await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true, name: true, price: true, available: true } });
    if (!product || !product.available) return { error: "This gift is no longer available." };

    let enquiryId: string | undefined;
    if (enquiryReference) {
      const enquiry = await prisma.enquiry.findUnique({ where: { referenceCode: enquiryReference }, select: { id: true, productId: true, status: true } });
      if (!enquiry || enquiry.productId !== product.id || ["CANCELLED", "CLOSED"].includes(enquiry.status)) return { error: "That customisation reference could not be matched to this product." };
      enquiryId = enquiry.id;
    }

    const subtotal = product.price.mul(quantity);
    const shippingAmount = new Prisma.Decimal("0.00");
    const totalAmount = subtotal.add(shippingAmount);
    const order = await prisma.order.create({
      data: {
        orderNumber: `LC-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
        enquiryId,
        customerName,
        customerPhone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        subtotal,
        shippingAmount,
        totalAmount,
        status: "PAYMENT_PENDING",
        items: { create: { productId: product.id, productNameSnapshot: product.name, unitPrice: product.price, quantity, customizationNotes: enquiryReference ? `Reference: ${enquiryReference}` : null } },
      },
    });
    orderNumber = order.orderNumber;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "We could not reserve that order number. Please try again." };
    return { error: "We could not prepare your order. Please try again." };
  }
  redirect(`/checkout/pay/${orderNumber}`);
}