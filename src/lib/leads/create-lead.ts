import { getCms } from "@/lib/cms";
import { formatCalculatorSummary } from "@/lib/leads/format-snapshot";
import {
  checkLeadRateLimit,
  MIN_FORM_FILL_MS,
} from "@/lib/leads/rate-limit";
import { validateLeadInput } from "@/lib/leads/validate";
import { type LeadFormInput, type LeadSubmitResult } from "@/types/lead";
import { currentLegalVersions } from "@/lib/legal/registry";

const ERROR_GENERIC =
  "Не удалось отправить заявку. Попробуйте ещё раз или воспользуйтесь контактами на странице.";

export type CreateLeadOptions = {
  /** Client IP or anonymous session key for rate limiting */
  rateLimitKey?: string;
};

/**
 * Server-only lead creation. Never call from client components directly.
 */
export async function createLead(
  raw: LeadFormInput,
  options: CreateLeadOptions = {}
): Promise<LeadSubmitResult> {
  // Honeypot: silent reject (no lead created)
  if (raw.companyWebsite && raw.companyWebsite.trim()) {
    return { ok: true };
  }

  const validated = validateLeadInput(raw);
  if (!validated.ok) {
    return {
      ok: false,
      code: "validation",
      message: validated.message,
      fieldErrors: validated.fieldErrors,
    };
  }

  const data = validated.data;

  if (
    typeof data.formMountedAt === "number" &&
    Number.isFinite(data.formMountedAt)
  ) {
    const elapsed = Date.now() - data.formMountedAt;
    if (elapsed >= 0 && elapsed < MIN_FORM_FILL_MS) {
      return { ok: true }; // silent timing reject
    }
  }

  const rateKey = options.rateLimitKey?.trim() || "anonymous";
  const rate = checkLeadRateLimit(rateKey);
  if (!rate.allowed) {
    return {
      ok: false,
      code: "rate_limit",
      message: ERROR_GENERIC,
    };
  }

  try {
    const payload = await getCms();
    const snapshot = data.calculatorSnapshot;
    const versions = currentLegalVersions();
    const consentAt = data.consentAcceptedAt;
    const expiresAt = new Date(
      Date.parse(consentAt) + 365 * 24 * 60 * 60 * 1000
    ).toISOString();

    await payload.create({
      collection: "leads",
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        preferredContact: data.preferredContact,
        comment: data.comment,
        source: data.source,
        contextType: data.contextType,
        contextSlug: data.contextSlug,
        status: "new",
        consentAccepted: true,
        consentAcceptedAt: consentAt,
        consentVersion: versions.consent,
        privacyPolicyVersion: versions.privacy,
        consentSource: data.source,
        lastActivityAt: consentAt,
        expiresAt,
        contractConcluded: false,
        hasCalculatorSnapshot: Boolean(snapshot),
        ...(snapshot
          ? {
              calculatorSummary: formatCalculatorSummary(snapshot),
              calculatorSnapshot: {
                objectType: snapshot.objectType,
                apartmentLayout: snapshot.apartmentLayout,
                area: snapshot.area,
                renovationType: snapshot.renovationType,
                condition: snapshot.condition,
                workTypes: snapshot.workTypes.map((w) => ({
                  slug: w.slug,
                  title: w.title,
                })),
                estimateMin: snapshot.estimateMin,
                estimateMax: snapshot.estimateMax,
                calculatedAt: snapshot.calculatedAt,
              },
            }
          : {}),
      },
      overrideAccess: true,
    });

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[leads] create failed: ${message}`);
    return {
      ok: false,
      code: "server",
      message: ERROR_GENERIC,
    };
  }
}
