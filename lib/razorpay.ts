import Razorpay from "razorpay";

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured.");
  return { keyId, keySecret, client: new Razorpay({ key_id: keyId, key_secret: keySecret }) };
}

export function amountInPaise(amount: { toNumber(): number }) {
  return Math.round(amount.toNumber() * 100);
}