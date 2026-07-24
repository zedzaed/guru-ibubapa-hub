const malayDateFormatter = new Intl.DateTimeFormat("ms-MY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Kuala_Lumpur",
});

export function formatDateMY(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00+08:00`) : value;
  return malayDateFormatter.format(date);
}

export function formatCurrencyMYR(value: number | string) {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());
}

export function currentMonthISO() {
  return todayISO().slice(0, 7);
}

export function isISODate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isISOMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value);
}
