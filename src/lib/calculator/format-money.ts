const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export function formatRub(value: number): string {
  return moneyFormatter.format(value);
}

export function formatRubRange(min: number, max: number): string {
  if (min === max) return formatRub(min);
  return `${formatRub(min)} – ${formatRub(max)}`;
}
