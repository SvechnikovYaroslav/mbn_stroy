import type {
  ApartmentLayout,
  CalculatorObjectType,
  PropertyCondition,
} from "@/types/calculator";
import type {
  LeadCalculatorSnapshot,
  LeadContextType,
  LeadFormInput,
  LeadPreferredContact,
  LeadSource,
} from "@/types/lead";
import type { RenovationType, WorkType } from "@/types/project";

const NAME_MAX = 120;
const PHONE_MAX = 40;
const EMAIL_MAX = 254;
const COMMENT_MAX = 4000;
const CONTEXT_SLUG_MAX = 120;
const WORK_TYPES_MAX = 20;

const SOURCES = new Set<LeadSource>([
  "contact",
  "calculator",
  "project",
  "service",
  "other",
]);

const PREFERRED = new Set<LeadPreferredContact>([
  "phone",
  "telegram",
  "whatsapp",
  "email",
]);

const OBJECT_TYPES = new Set<CalculatorObjectType>([
  "apartment",
  "house",
  "commercial",
]);

const LAYOUTS = new Set<ApartmentLayout>([
  "studio",
  "1-room",
  "2-room",
  "3-room",
  "4-plus",
]);

const RENOVATIONS = new Set<RenovationType>([
  "cosmetic",
  "capital",
  "turnkey",
]);

const CONDITIONS = new Set<PropertyCondition>([
  "new-build",
  "secondary",
  "rough",
]);

const WORK_TYPES = new Set<WorkType>([
  "finishing",
  "electrical",
  "plumbing",
  "stretch-ceilings",
  "windows",
  "flooring",
  "tiling",
  "painting",
  "demolition",
  "doors",
  "heating",
  "other",
]);

const CONTEXT_TYPES = new Set<LeadContextType>(["project", "service"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidatedLeadInput = {
  name?: string;
  phone?: string;
  email?: string;
  preferredContact?: LeadPreferredContact;
  comment?: string;
  source: LeadSource;
  contextType?: LeadContextType;
  contextSlug?: string;
  calculatorSnapshot?: LeadCalculatorSnapshot;
  consentAccepted: true;
  consentAcceptedAt: string;
  formMountedAt?: number;
  companyWebsite?: string;
};

function trim(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  if (!next) return undefined;
  return next.slice(0, max);
}

function normalizePhone(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, PHONE_MAX);
}

export function validateLeadInput(raw: LeadFormInput): {
  ok: true;
  data: ValidatedLeadInput;
} | {
  ok: false;
  message: string;
  fieldErrors: Partial<Record<string, string>>;
} {
  const fieldErrors: Partial<Record<string, string>> = {};

  if (!raw.consentAccepted) {
    fieldErrors.consentAccepted =
      "Нужно согласие на обработку персональных данных.";
  }

  const name = trim(raw.name, NAME_MAX);
  const phoneRaw = trim(raw.phone, PHONE_MAX);
  const email = trim(raw.email, EMAIL_MAX)?.toLowerCase();
  const comment = trim(raw.comment, COMMENT_MAX);
  const contextSlug = trim(raw.contextSlug, CONTEXT_SLUG_MAX);

  const phone = phoneRaw ? normalizePhone(phoneRaw) : undefined;

  if (!phone && !email) {
    fieldErrors.phone = "Укажите телефон или email.";
    fieldErrors.email = "Укажите телефон или email.";
  }

  if (email && !EMAIL_RE.test(email)) {
    fieldErrors.email = "Проверьте формат email.";
  }

  if (phone && phone.replace(/\D/g, "").length < 10) {
    fieldErrors.phone = "Укажите корректный номер телефона.";
  }

  if (!SOURCES.has(raw.source)) {
    fieldErrors.source = "Некорректный источник заявки.";
  }

  let preferredContact: LeadPreferredContact | undefined;
  if (raw.preferredContact) {
    if (!PREFERRED.has(raw.preferredContact)) {
      fieldErrors.preferredContact = "Некорректный способ связи.";
    } else {
      preferredContact = raw.preferredContact;
    }
  }

  let contextType: LeadContextType | undefined;
  if (raw.contextType) {
    if (!CONTEXT_TYPES.has(raw.contextType)) {
      fieldErrors.contextType = "Некорректный контекст.";
    } else {
      contextType = raw.contextType;
    }
  }

  if (contextSlug && !contextType) {
    fieldErrors.contextType = "Укажите тип контекста.";
  }

  let calculatorSnapshot: LeadCalculatorSnapshot | undefined;
  if (raw.calculatorSnapshot) {
    const snap = validateCalculatorSnapshot(raw.calculatorSnapshot);
    if (!snap.ok) {
      fieldErrors.calculatorSnapshot = snap.message;
    } else {
      calculatorSnapshot = snap.data;
    }
  }

  if (raw.source === "calculator" && !calculatorSnapshot) {
    fieldErrors.calculatorSnapshot =
      "К заявке из калькулятора нужен снимок расчёта.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Проверьте заполнение формы.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      ...(name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(preferredContact ? { preferredContact } : {}),
      ...(comment ? { comment } : {}),
      source: raw.source,
      ...(contextType ? { contextType } : {}),
      ...(contextSlug ? { contextSlug } : {}),
      ...(calculatorSnapshot ? { calculatorSnapshot } : {}),
      consentAccepted: true,
      consentAcceptedAt: new Date().toISOString(),
      ...(typeof raw.formMountedAt === "number"
        ? { formMountedAt: raw.formMountedAt }
        : {}),
      ...(typeof raw.companyWebsite === "string"
        ? { companyWebsite: raw.companyWebsite }
        : {}),
    },
  };
}

function validateCalculatorSnapshot(raw: LeadCalculatorSnapshot): {
  ok: true;
  data: LeadCalculatorSnapshot;
} | {
  ok: false;
  message: string;
} {
  if (!raw || typeof raw !== "object") {
    return { ok: false, message: "Некорректный снимок расчёта." };
  }

  // Reject giant unexpected payloads
  try {
    if (JSON.stringify(raw).length > 8_000) {
      return { ok: false, message: "Слишком большой снимок расчёта." };
    }
  } catch {
    return { ok: false, message: "Некорректный снимок расчёта." };
  }

  if (!OBJECT_TYPES.has(raw.objectType)) {
    return { ok: false, message: "Некорректный тип объекта в расчёте." };
  }

  if (
    raw.apartmentLayout !== undefined &&
    !LAYOUTS.has(raw.apartmentLayout)
  ) {
    return { ok: false, message: "Некорректная планировка в расчёте." };
  }

  if (
    typeof raw.area !== "number" ||
    !Number.isFinite(raw.area) ||
    raw.area <= 0 ||
    raw.area > 1000
  ) {
    return { ok: false, message: "Некорректная площадь в расчёте." };
  }

  if (!RENOVATIONS.has(raw.renovationType)) {
    return { ok: false, message: "Некорректный тип ремонта в расчёте." };
  }

  if (!CONDITIONS.has(raw.condition)) {
    return { ok: false, message: "Некорректное состояние в расчёте." };
  }

  if (!Array.isArray(raw.workTypes) || raw.workTypes.length > WORK_TYPES_MAX) {
    return { ok: false, message: "Некорректный список работ в расчёте." };
  }

  const workTypes = [];
  for (const item of raw.workTypes) {
    if (!item || typeof item !== "object") {
      return { ok: false, message: "Некорректный вид работ в расчёте." };
    }
    if (!WORK_TYPES.has(item.slug as WorkType)) {
      return { ok: false, message: "Неизвестный вид работ в расчёте." };
    }
    const title =
      typeof item.title === "string" && item.title.trim()
        ? item.title.trim().slice(0, 120)
        : String(item.slug);
    workTypes.push({ slug: item.slug as WorkType, title });
  }

  if (
    typeof raw.estimateMin !== "number" ||
    typeof raw.estimateMax !== "number" ||
    !Number.isFinite(raw.estimateMin) ||
    !Number.isFinite(raw.estimateMax) ||
    raw.estimateMin < 0 ||
    raw.estimateMax < 0 ||
    raw.estimateMin > raw.estimateMax
  ) {
    return { ok: false, message: "Некорректный диапазон стоимости." };
  }

  const calculatedAt =
    typeof raw.calculatedAt === "string" && raw.calculatedAt.trim()
      ? raw.calculatedAt.trim().slice(0, 40)
      : new Date().toISOString();

  return {
    ok: true,
    data: {
      objectType: raw.objectType,
      ...(raw.apartmentLayout ? { apartmentLayout: raw.apartmentLayout } : {}),
      area: Math.round(raw.area),
      renovationType: raw.renovationType,
      condition: raw.condition,
      workTypes,
      estimateMin: Math.round(raw.estimateMin),
      estimateMax: Math.round(raw.estimateMax),
      calculatedAt,
    },
  };
}
