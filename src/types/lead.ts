import type {
  ApartmentLayout,
  CalculatorObjectType,
  PropertyCondition,
} from "@/types/calculator";
import type { RenovationType, WorkType } from "@/types/project";

export type LeadSource =
  | "contact"
  | "calculator"
  | "project"
  | "service"
  | "other";

export type LeadPreferredContact =
  | "phone"
  | "telegram"
  | "whatsapp"
  | "email";

export type LeadContextType = "project" | "service";

export type LeadCalculatorWorkType = {
  slug: WorkType;
  title: string;
};

/**
 * Immutable calculator snapshot attached to a lead.
 * Must match what the user saw — never recalculated later.
 */
export type LeadCalculatorSnapshot = {
  objectType: CalculatorObjectType;
  apartmentLayout?: ApartmentLayout;
  area: number;
  renovationType: RenovationType;
  condition: PropertyCondition;
  workTypes: LeadCalculatorWorkType[];
  estimateMin: number;
  estimateMax: number;
  calculatedAt: string;
};

export type LeadFormInput = {
  name?: string;
  phone?: string;
  email?: string;
  preferredContact?: LeadPreferredContact;
  comment?: string;
  source: LeadSource;
  contextType?: LeadContextType;
  contextSlug?: string;
  calculatorSnapshot?: LeadCalculatorSnapshot;
  consentAccepted: boolean;
  /** Honeypot — must stay empty */
  companyWebsite?: string;
  /** Client form mount time (ms) for timing check */
  formMountedAt?: number;
};

export type LeadSubmitResult =
  | { ok: true }
  | {
      ok: false;
      code: "validation" | "spam" | "rate_limit" | "disabled" | "server";
      message: string;
      fieldErrors?: Partial<Record<string, string>>;
    };

export const CONSENT_VERSION = "v1";
