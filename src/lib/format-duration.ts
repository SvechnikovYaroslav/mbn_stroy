import type { DurationUnit } from "@/types/project";

/**
 * Russian plural forms for duration units.
 * 1 месяц / 2 месяца / 5 месяцев, 1 год / 2 года / 5 лет, …
 */
export function formatDuration(
  value: number | null | undefined,
  unit: DurationUnit | null | undefined
): string | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  if (!unit) return undefined;

  const n = Math.round(value);
  const mod10 = n % 10;
  const mod100 = n % 100;

  const form = (one: string, few: string, many: string) => {
    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  };

  const unitLabel =
    unit === "day"
      ? form("день", "дня", "дней")
      : unit === "month"
        ? form("месяц", "месяца", "месяцев")
        : form("год", "года", "лет");

  return `${n} ${unitLabel}`;
}
