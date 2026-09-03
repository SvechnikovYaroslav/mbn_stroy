"use client";

import { useMemo, useState } from "react";

import { OptionCard } from "@/components/calculator/option-card";
import { buttonVariants } from "@/components/ui/button";
import {
  AREA_DEFAULT,
  AREA_HARD_MAX,
  AREA_SLIDER_MAX,
  AREA_SLIDER_MIN,
  apartmentLayoutLabels,
  calculatorObjectTypeLabels,
  calculatorRenovationDescriptions,
  propertyConditionLabels,
} from "@/config/calculator";
import { siteConfig } from "@/config/site";
import { renovationTypeLabels } from "@/config/project";
import {
  calculateRenovation,
  getAvailableConditions,
  getAvailableObjectTypes,
  getAvailableRenovationTypes,
  getAvailableWorkRules,
} from "@/lib/calculator/calculate-renovation";
import { formatRubRange } from "@/lib/calculator/format-money";
import { cn } from "@/lib/utils";
import type {
  ApartmentLayout,
  CalculatorConfig,
  CalculatorInput,
  CalculatorObjectType,
  PropertyCondition,
} from "@/types/calculator";
import type { RenovationType, WorkType } from "@/types/project";

const INPUT_STEPS = 5;

type CalculatorWizardProps = {
  config: CalculatorConfig;
  isDemo?: boolean;
};

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function CalculatorWizard({
  config,
  isDemo = false,
}: CalculatorWizardProps) {
  const objectTypes = useMemo(
    () => getAvailableObjectTypes(config),
    [config]
  );

  const [step, setStep] = useState<Step>(1);
  const [objectType, setObjectType] = useState<CalculatorObjectType | null>(
    null
  );
  const [apartmentLayout, setApartmentLayout] =
    useState<ApartmentLayout | null>(null);
  const [area, setArea] = useState(AREA_DEFAULT);
  const [areaInput, setAreaInput] = useState(String(AREA_DEFAULT));
  const [renovationType, setRenovationType] = useState<RenovationType | null>(
    null
  );
  const [condition, setCondition] = useState<PropertyCondition | null>(null);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);

  const renovationOptions = useMemo(
    () =>
      objectType ? getAvailableRenovationTypes(config, objectType) : [],
    [config, objectType]
  );
  const conditionOptions = useMemo(
    () => getAvailableConditions(config),
    [config]
  );
  const workRules = useMemo(() => getAvailableWorkRules(config), [config]);

  const input: CalculatorInput | null =
    objectType && renovationType && condition
      ? {
          objectType,
          area,
          renovationType,
          condition,
          workTypes,
          ...(objectType === "apartment" && apartmentLayout
            ? { apartmentLayout }
            : {}),
        }
      : null;

  const outcome = input ? calculateRenovation(input, config) : null;

  function syncArea(next: number) {
    const clamped = Math.min(AREA_HARD_MAX, Math.max(1, Math.round(next)));
    setArea(clamped);
    setAreaInput(String(clamped));
  }

  function canContinue(): boolean {
    switch (step) {
      case 1:
        if (!objectType) return false;
        if (objectType === "apartment" && !apartmentLayout) return false;
        return true;
      case 2:
        return area >= 1 && area <= AREA_HARD_MAX;
      case 3:
        return Boolean(renovationType);
      case 4:
        return Boolean(condition);
      case 5:
        return true;
      default:
        return false;
    }
  }

  function goNext() {
    if (step < 5 && canContinue()) {
      setStep((step + 1) as Step);
      return;
    }
    if (step === 5 && canContinue()) {
      setStep(6);
    }
  }

  function goBack() {
    if (step === 1) return;
    setStep((step - 1) as Step);
  }

  function toggleWork(slug: WorkType) {
    setWorkTypes((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  }

  if (!config.enabled || objectTypes.length === 0) {
    return (
      <div className="border border-border p-6 md:p-8">
        <p className="text-body text-muted-foreground">
          Для выбранных параметров расчёт пока недоступен. Свяжитесь с нами для
          оценки стоимости.
        </p>
        <a
          href={siteConfig.cta.href}
          className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}
        >
          {siteConfig.cta.title}
        </a>
      </div>
    );
  }

  return (
    <div className="border border-border">
      {step <= 5 ? (
        <div className="border-b border-border px-4 py-4 md:px-8">
          <p className="text-caption text-muted-foreground">
            Шаг {step} из {INPUT_STEPS}
          </p>
          <div
            className="mt-3 h-1 w-full bg-muted"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={INPUT_STEPS}
            aria-valuenow={step}
            aria-label={`Прогресс: шаг ${step} из ${INPUT_STEPS}`}
          >
            <div
              className="h-full bg-foreground transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${(step / INPUT_STEPS) * 100}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="px-4 py-8 md:px-8 md:py-10">
        {step === 1 ? (
          <fieldset>
            <legend className="text-h2 text-foreground">
              Что ремонтируем?
            </legend>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {objectTypes.map((type) => (
                <OptionCard
                  key={type}
                  name="objectType"
                  label={calculatorObjectTypeLabels[type]}
                  selected={objectType === type}
                  onSelect={() => {
                    setObjectType(type);
                    if (type !== "apartment") setApartmentLayout(null);
                    setRenovationType(null);
                  }}
                />
              ))}
            </div>

            {objectType === "apartment" ? (
              <div className="mt-10">
                <p className="text-h3 text-foreground">
                  Какой формат квартиры?
                </p>
                <p className="mt-2 text-small text-muted-foreground">
                  Не влияет на расчёт — помогает уточнить задачу.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(
                    Object.keys(apartmentLayoutLabels) as ApartmentLayout[]
                  ).map((layout) => (
                    <OptionCard
                      key={layout}
                      name="apartmentLayout"
                      label={apartmentLayoutLabels[layout]}
                      selected={apartmentLayout === layout}
                      onSelect={() => setApartmentLayout(layout)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset>
            <legend className="text-h2 text-foreground">Площадь</legend>
            <p className="mt-2 text-body text-muted-foreground">
              Укажите площадь объекта в м².
            </p>
            <div className="mt-8 max-w-xl space-y-6">
              <label className="block">
                <span className="text-caption text-muted-foreground">
                  Значение, м²
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={AREA_HARD_MAX}
                  value={areaInput}
                  onChange={(event) => {
                    const raw = event.target.value;
                    setAreaInput(raw);
                    const parsed = Number(raw);
                    if (Number.isFinite(parsed) && parsed > 0) {
                      setArea(
                        Math.min(AREA_HARD_MAX, Math.max(1, Math.round(parsed)))
                      );
                    }
                  }}
                  onBlur={() => {
                    const parsed = Number(areaInput);
                    if (!Number.isFinite(parsed) || parsed <= 0) {
                      syncArea(AREA_DEFAULT);
                      return;
                    }
                    syncArea(parsed);
                  }}
                  className="mt-2 w-full border border-border bg-transparent px-3 py-2 text-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="block">
                <span className="sr-only">Слайдер площади</span>
                <input
                  type="range"
                  min={AREA_SLIDER_MIN}
                  max={AREA_SLIDER_MAX}
                  value={Math.min(AREA_SLIDER_MAX, Math.max(AREA_SLIDER_MIN, area))}
                  onChange={(event) => syncArea(Number(event.target.value))}
                  className="w-full accent-foreground"
                />
                <span className="mt-2 flex justify-between text-caption text-muted-foreground">
                  <span>{AREA_SLIDER_MIN} м²</span>
                  <span>{AREA_SLIDER_MAX} м²</span>
                </span>
              </label>
              {area > AREA_SLIDER_MAX ? (
                <p className="text-small text-muted-foreground">
                  Площадь больше {AREA_SLIDER_MAX} м² задана вручную (до{" "}
                  {AREA_HARD_MAX} м²).
                </p>
              ) : null}
            </div>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset>
            <legend className="text-h2 text-foreground">
              Какой ремонт нужен?
            </legend>
            <div className="mt-6 grid gap-3">
              {renovationOptions.map((type) => (
                <OptionCard
                  key={type}
                  name="renovationType"
                  label={renovationTypeLabels[type]}
                  description={calculatorRenovationDescriptions[type]}
                  selected={renovationType === type}
                  onSelect={() => setRenovationType(type)}
                />
              ))}
            </div>
            {renovationOptions.length === 0 ? (
              <p className="mt-4 text-body text-muted-foreground">
                Для выбранных параметров расчёт пока недоступен. Свяжитесь с
                нами для оценки стоимости.
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {step === 4 ? (
          <fieldset>
            <legend className="text-h2 text-foreground">
              В каком состоянии объект?
            </legend>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {conditionOptions.map((item) => (
                <OptionCard
                  key={item}
                  name="condition"
                  label={propertyConditionLabels[item]}
                  selected={condition === item}
                  onSelect={() => setCondition(item)}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 5 ? (
          <fieldset>
            <legend className="text-h2 text-foreground">
              Какие работы потребуются?
            </legend>
            <p className="mt-2 text-body text-muted-foreground">
              Можно выбрать несколько вариантов.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {workRules.map((rule) => (
                <OptionCard
                  key={rule.workType}
                  type="checkbox"
                  name="workTypes"
                  label={rule.title}
                  selected={workTypes.includes(rule.workType)}
                  onSelect={() => toggleWork(rule.workType)}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 6 && outcome ? (
          <div aria-live="polite">
            <h2 className="text-h2 text-foreground">
              Предварительная стоимость
            </h2>
            {outcome.available ? (
              <p className="mt-6 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                {formatRubRange(outcome.min, outcome.max)}
              </p>
            ) : (
              <p className="mt-6 text-body text-muted-foreground">
                Для выбранных параметров расчёт пока недоступен. Свяжитесь с
                нами для оценки стоимости.
              </p>
            )}

            {isDemo ? (
              <p className="mt-3 text-caption text-muted-foreground">
                Демонстрационный расчёт
              </p>
            ) : null}

            {input ? (
              <dl className="mt-8 space-y-2 text-body text-muted-foreground">
                <div>
                  <dt className="sr-only">Объект</dt>
                  <dd>
                    {calculatorObjectTypeLabels[input.objectType]}
                    {input.apartmentLayout
                      ? ` · ${apartmentLayoutLabels[input.apartmentLayout]}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Площадь</dt>
                  <dd>{input.area} м²</dd>
                </div>
                <div>
                  <dt className="sr-only">Тип ремонта</dt>
                  <dd>{renovationTypeLabels[input.renovationType]}</dd>
                </div>
                <div>
                  <dt className="sr-only">Состояние</dt>
                  <dd>{propertyConditionLabels[input.condition]}</dd>
                </div>
                {input.workTypes.length > 0 ? (
                  <div className="pt-2">
                    <dt className="text-caption">Работы</dt>
                    <dd className="mt-1 text-foreground">
                      {input.workTypes
                        .map((slug) => {
                          const rule = workRules.find(
                            (item) => item.workType === slug
                          );
                          return rule?.title ?? slug;
                        })
                        .join(" · ")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <p className="mt-8 max-w-2xl text-small text-muted-foreground">
              Расчёт является предварительным и не является публичной офертой.
              Точная стоимость определяется после осмотра объекта, уточнения
              объёма работ и составления сметы.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={siteConfig.cta.href}
                className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
              >
                Обсудить расчёт
              </a>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "inline-flex"
                )}
              >
                Изменить параметры
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {step <= 5 ? (
        <div className="flex flex-col-reverse gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex"
              )}
            >
              ← Назад
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue()}
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            {step === 5 ? "Рассчитать стоимость" : "Далее →"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
