import {
  apartmentLayoutLabels,
  calculatorObjectTypeLabels,
  propertyConditionLabels,
} from "@/config/calculator";
import { renovationTypeLabels } from "@/config/project";
import { formatRubRange } from "@/lib/calculator/format-money";
import type { LeadCalculatorSnapshot } from "@/types/lead";

/**
 * Human-readable calculator block for Payload admin.
 */
export function formatCalculatorSummary(
  snapshot: LeadCalculatorSnapshot
): string {
  const lines: string[] = [
    "Расчёт",
    "",
    calculatorObjectTypeLabels[snapshot.objectType],
  ];

  if (snapshot.apartmentLayout) {
    lines.push(apartmentLayoutLabels[snapshot.apartmentLayout]);
  }

  lines.push(
    `${snapshot.area} м²`,
    renovationTypeLabels[snapshot.renovationType],
    propertyConditionLabels[snapshot.condition],
    ""
  );

  if (snapshot.workTypes.length > 0) {
    lines.push("Работы:");
    for (const work of snapshot.workTypes) {
      lines.push(work.title || work.slug);
    }
    lines.push("");
  }

  lines.push(
    "Предварительная стоимость:",
    formatRubRange(snapshot.estimateMin, snapshot.estimateMax)
  );

  return lines.join("\n");
}
