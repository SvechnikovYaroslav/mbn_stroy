import type { GlobalConfig } from "payload";

import { authenticated } from "@/access";
import { renovationTypeLabels } from "@/config/project";

const objectTypeOptions = [
  { value: "apartment", label: "Квартира" },
  { value: "house", label: "Дом" },
  { value: "commercial", label: "Коммерческое помещение" },
];

const renovationTypeOptions = (
  Object.entries(renovationTypeLabels) as [string, string][]
).map(([value, label]) => ({ value, label }));

function minMaxValidate(
  minField: string,
  maxField: string,
  message: string
) {
  return (
    value: unknown,
    { siblingData }: { siblingData?: Record<string, unknown> }
  ) => {
    const min = Number(siblingData?.[minField] ?? value);
    const max = Number(siblingData?.[maxField]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return true;
    if (min > max) return message;
    return true;
  };
}

/**
 * Single source of calculator pricing numbers.
 * Admins edit values — not the calculation formula.
 */
export const CalculatorSettings: GlobalConfig = {
  slug: "calculator-settings",
  label: "Калькулятор",
  admin: {
    description:
      "Цены и коэффициенты для калькулятора на сайте. Формула расчёта фиксирована в коде и здесь не редактируется.",
    group: "Сайт",
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Основные настройки",
          fields: [
            {
              name: "enabled",
              type: "checkbox",
              label: "Калькулятор включён",
              defaultValue: true,
            },
            {
              name: "minimumPrice",
              type: "number",
              label: "Минимальная стоимость ремонта",
              required: true,
              min: 0,
              defaultValue: 300_000,
              admin: {
                description: "₽. Итоговый минимум не ниже этого значения.",
              },
              validate: (value: unknown) => {
                if (typeof value !== "number" || value < 0) {
                  return "Укажите сумму ≥ 0";
                }
                return true;
              },
            },
            {
              name: "roundingStep",
              type: "number",
              label: "Шаг округления результата",
              required: true,
              min: 1,
              defaultValue: 10_000,
              admin: {
                description: "₽. Например 10000 → 1 480 000, а не 1 483 472.",
              },
              validate: (value: unknown) => {
                if (typeof value !== "number" || value <= 0) {
                  return "Шаг округления должен быть больше 0";
                }
                return true;
              },
            },
          ],
        },
        {
          label: "Базовые цены",
          fields: [
            {
              name: "baseRates",
              type: "array",
              label: "Базовые ставки",
              labels: { singular: "Ставка", plural: "Ставки" },
              admin: {
                description: "₽ за м². Диапазон min–max для типа объекта и ремонта.",
                initCollapsed: true,
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "objectType",
                      type: "select",
                      label: "Тип объекта",
                      required: true,
                      options: objectTypeOptions,
                      admin: { width: "33%" },
                    },
                    {
                      name: "renovationType",
                      type: "select",
                      label: "Тип ремонта",
                      required: true,
                      options: renovationTypeOptions,
                      admin: { width: "33%" },
                    },
                    {
                      name: "active",
                      type: "checkbox",
                      label: "Активна",
                      defaultValue: true,
                      admin: { width: "33%" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "minPricePerM2",
                      type: "number",
                      label: "Цена от, ₽/м²",
                      required: true,
                      min: 0,
                      admin: { width: "50%" },
                      validate: minMaxValidate(
                        "minPricePerM2",
                        "maxPricePerM2",
                        "Минимум не может быть больше максимума"
                      ),
                    },
                    {
                      name: "maxPricePerM2",
                      type: "number",
                      label: "Цена до, ₽/м²",
                      required: true,
                      min: 0,
                      admin: { width: "50%" },
                      validate: minMaxValidate(
                        "minPricePerM2",
                        "maxPricePerM2",
                        "Минимум не может быть больше максимума"
                      ),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Состояние объекта",
          fields: [
            {
              name: "conditionRules",
              type: "array",
              label: "Коэффициенты состояния",
              labels: { singular: "Правило", plural: "Правила" },
              admin: {
                initCollapsed: true,
                description: "Множители к базовой стоимости.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "condition",
                      type: "select",
                      label: "Состояние",
                      required: true,
                      options: [
                        { label: "Новостройка", value: "new-build" },
                        { label: "Вторичное жильё", value: "secondary" },
                        { label: "Черновая отделка", value: "rough" },
                      ],
                      admin: { width: "50%" },
                    },
                    {
                      name: "active",
                      type: "checkbox",
                      label: "Активно",
                      defaultValue: true,
                      admin: { width: "50%" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "minMultiplier",
                      type: "number",
                      label: "Коэффициент от",
                      required: true,
                      min: 0,
                      admin: { width: "50%" },
                      validate: minMaxValidate(
                        "minMultiplier",
                        "maxMultiplier",
                        "Минимум не может быть больше максимума"
                      ),
                    },
                    {
                      name: "maxMultiplier",
                      type: "number",
                      label: "Коэффициент до",
                      required: true,
                      min: 0,
                      admin: { width: "50%" },
                      validate: minMaxValidate(
                        "minMultiplier",
                        "maxMultiplier",
                        "Минимум не может быть больше максимума"
                      ),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Дополнительные работы",
          fields: [
            {
              name: "workRules",
              type: "array",
              label: "Правила работ",
              labels: { singular: "Правило", plural: "Правила" },
              admin: {
                initCollapsed: true,
                description:
                  "Если «Входит в базу» — работа видна в wizard, но не добавляет цену отдельно.",
              },
              fields: [
                {
                  name: "workType",
                  type: "relationship",
                  label: "Вид работ",
                  relationTo: "work-types",
                  required: true,
                  admin: { allowCreate: false },
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "pricingMode",
                      type: "select",
                      label: "Способ расчёта",
                      required: true,
                      defaultValue: "per_m2",
                      options: [
                        { label: "За м²", value: "per_m2" },
                        { label: "Фиксированная сумма", value: "fixed" },
                        {
                          label: "Процент к базовой стоимости",
                          value: "percent",
                        },
                      ],
                      admin: { width: "33%" },
                    },
                    {
                      name: "includedInBase",
                      type: "checkbox",
                      label: "Входит в базу",
                      defaultValue: false,
                      admin: { width: "33%" },
                    },
                    {
                      name: "active",
                      type: "checkbox",
                      label: "Активно",
                      defaultValue: true,
                      admin: { width: "33%" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "minPrice",
                      type: "number",
                      label: "От",
                      required: true,
                      min: 0,
                      admin: {
                        width: "50%",
                        description:
                          "₽/м², ₽ или % — в зависимости от способа расчёта.",
                      },
                      validate: minMaxValidate(
                        "minPrice",
                        "maxPrice",
                        "Минимум не может быть больше максимума"
                      ),
                    },
                    {
                      name: "maxPrice",
                      type: "number",
                      label: "До",
                      required: true,
                      min: 0,
                      admin: { width: "50%" },
                      validate: minMaxValidate(
                        "minPrice",
                        "maxPrice",
                        "Минимум не может быть больше максимума"
                      ),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
