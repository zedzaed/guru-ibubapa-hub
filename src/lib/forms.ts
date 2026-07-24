export function requiredText(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${label} diperlukan.`);
  return value;
}

export function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export function requiredInteger(formData: FormData, key: string, label: string) {
  const raw = requiredText(formData, key, label);
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value)) throw new Error(`${label} tidak sah.`);
  return value;
}
