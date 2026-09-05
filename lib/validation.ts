export function requiredText(value: FormDataEntryValue | null, field: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${field} is required.`);
  return text;
}

export function optionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

export function decimalText(value: FormDataEntryValue | null, field: string, optional = false) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text && optional) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error(`${field} must be a valid amount.`);
  if (Number(text) < 0) throw new Error(`${field} cannot be negative.`);
  return text;
}

export function booleanField(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}