"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  LeadCalculatorSnapshot,
  LeadContextType,
  LeadSource,
  LeadSubmitResult,
} from "@/types/lead";

type LeadFormProps = {
  source: LeadSource;
  contextType?: LeadContextType;
  contextSlug?: string;
  calculatorSnapshot?: LeadCalculatorSnapshot;
  heading?: string;
  intro?: string;
  submitLabel?: string;
  /** GitHub Pages / static demo — block real submission */
  submissionsDisabled?: boolean;
  className?: string;
};

async function postLead(
  payload: Record<string, unknown>
): Promise<LeadSubmitResult> {
  try {
    const response = await fetch("/api/public-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as LeadSubmitResult;
    if (data && typeof data === "object" && "ok" in data) {
      return data;
    }

    return {
      ok: false,
      code: "server",
      message:
        "Не удалось отправить заявку. Попробуйте ещё раз или воспользуйтесь контактами на странице.",
    };
  } catch {
    return {
      ok: false,
      code: "server",
      message:
        "Не удалось отправить заявку. Попробуйте ещё раз или воспользуйтесь контактами на странице.",
    };
  }
}

export function LeadForm({
  source,
  contextType,
  contextSlug,
  calculatorSnapshot,
  heading = "Расскажите о задаче",
  intro = "Оставьте контакты и кратко опишите объект. Мы сможем обсудить задачу и уточнить детали ремонта.",
  submitLabel = "Отправить заявку",
  submissionsDisabled = false,
  className,
}: LeadFormProps) {
  const formId = useId();
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [mountedAt] = useState(() => Date.now());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LeadSubmitResult | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const fieldErrors =
    result && !result.ok && result.code === "validation"
      ? result.fieldErrors
      : undefined;

  useEffect(() => {
    if (result?.ok) {
      successRef.current?.focus();
    } else if (result && !result.ok) {
      errorRef.current?.focus();
    }
  }, [result]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionsDisabled || pending) return;

    const form = event.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      comment: String(fd.get("comment") || ""),
      companyWebsite: String(fd.get("companyWebsite") || ""),
      consentAccepted,
      source,
      formMountedAt: mountedAt,
      ...(contextType ? { contextType } : {}),
      ...(contextSlug ? { contextSlug } : {}),
      ...(calculatorSnapshot ? { calculatorSnapshot } : {}),
    };

    startTransition(async () => {
      const next = await postLead(payload);
      setResult(next);
      if (next.ok) {
        form.reset();
        setConsentAccepted(false);
      }
    });
  }

  if (result?.ok) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className={cn("max-w-xl outline-none", className)}
        role="status"
        aria-live="polite"
      >
        <h2 className="text-h2 text-foreground">Заявка отправлена</h2>
        <p className="mt-4 text-body-lg text-muted-foreground">
          Спасибо. Мы получили информацию об объекте и свяжемся с вами по
          указанным контактам.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}
        >
          Вернуться на сайт
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("max-w-xl", className)}>
      <h2 className="text-h2 text-foreground">{heading}</h2>
      {intro ? (
        <p className="mt-4 text-body text-muted-foreground">{intro}</p>
      ) : null}

      {submissionsDisabled ? (
        <p
          className="mt-6 border border-border bg-muted/40 px-4 py-3 text-body text-muted-foreground"
          role="status"
        >
          Демонстрационная версия — отправка заявок отключена.
        </p>
      ) : null}

      <form
        className="mt-8 space-y-5"
        onSubmit={onSubmit}
        noValidate
        aria-describedby={
          result && !result.ok ? `${formId}-form-error` : undefined
        }
      >
        {/* Honeypot */}
        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor={`${formId}-companyWebsite`}>Company website</label>
          <input
            id={`${formId}-companyWebsite`}
            name="companyWebsite"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor={`${formId}-name`}
            className="text-small text-foreground"
          >
            Имя
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            disabled={submissionsDisabled || pending}
            className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            aria-invalid={Boolean(fieldErrors?.name)}
            aria-describedby={
              fieldErrors?.name ? `${formId}-name-error` : undefined
            }
          />
          {fieldErrors?.name ? (
            <p
              id={`${formId}-name-error`}
              className="mt-1 text-small text-destructive"
            >
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${formId}-phone`}
            className="text-small text-foreground"
          >
            Телефон
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
            disabled={submissionsDisabled || pending}
            className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            aria-invalid={Boolean(fieldErrors?.phone)}
            aria-describedby={
              fieldErrors?.phone ? `${formId}-phone-error` : undefined
            }
          />
          {fieldErrors?.phone ? (
            <p
              id={`${formId}-phone-error`}
              className="mt-1 text-small text-destructive"
            >
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${formId}-email`}
            className="text-small text-foreground"
          >
            Email
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            disabled={submissionsDisabled || pending}
            className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby={
              fieldErrors?.email ? `${formId}-email-error` : undefined
            }
          />
          {fieldErrors?.email ? (
            <p
              id={`${formId}-email-error`}
              className="mt-1 text-small text-destructive"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${formId}-comment`}
            className="text-small text-foreground"
          >
            Расскажите о задаче
          </label>
          <textarea
            id={`${formId}-comment`}
            name="comment"
            rows={4}
            maxLength={4000}
            disabled={submissionsDisabled || pending}
            className="mt-2 w-full resize-y border border-border bg-background px-3 py-2.5 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            aria-invalid={Boolean(fieldErrors?.comment)}
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-small text-foreground">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
              disabled={submissionsDisabled || pending}
              className="mt-1 size-4 shrink-0 border border-border accent-primary"
              aria-invalid={Boolean(fieldErrors?.consentAccepted)}
              aria-describedby={
                fieldErrors?.consentAccepted
                  ? `${formId}-consent-error`
                  : `${formId}-consent-help`
              }
            />
            <span>
              Я даю{" "}
              <Link
                href="/personal-data-consent"
                className="underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => event.stopPropagation()}
              >
                согласие на обработку персональных данных
              </Link>
            </span>
          </label>
          {fieldErrors?.consentAccepted ? (
            <p
              id={`${formId}-consent-error`}
              className="mt-1 text-small text-destructive"
            >
              {fieldErrors.consentAccepted}
            </p>
          ) : (
            <p
              id={`${formId}-consent-help`}
              className="mt-2 text-small text-muted-foreground"
            >
              Подробнее о порядке обработки данных — в{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Политике обработки персональных данных
              </Link>
              .
            </p>
          )}
        </div>

        <p className="text-small text-muted-foreground">
          Контактные данные используются для связи по вашей заявке.
        </p>

        {result && !result.ok ? (
          <p
            ref={errorRef}
            id={`${formId}-form-error`}
            tabIndex={-1}
            className="text-body text-destructive outline-none"
            role="alert"
          >
            {result.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submissionsDisabled || pending}
          className={cn(
            buttonVariants({ size: "lg" }),
            "inline-flex disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          {pending ? "Отправка…" : submitLabel}
        </button>
      </form>
    </div>
  );
}
