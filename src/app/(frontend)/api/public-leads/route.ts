import { createLead } from "@/lib/leads/create-lead";
import type { LeadFormInput } from "@/types/lead";

export const runtime = "nodejs";

function rateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Public lead intake. Not the Payload REST collection endpoint.
 * create access on `leads` remains false for anonymous users.
 */
export async function POST(request: Request) {
  let body: LeadFormInput;

  try {
    body = (await request.json()) as LeadFormInput;
  } catch {
    return Response.json(
      {
        ok: false,
        code: "validation",
        message: "Некорректные данные формы.",
      },
      { status: 400 }
    );
  }

  // Reject oversized payloads early
  try {
    if (JSON.stringify(body).length > 16_000) {
      return Response.json(
        {
          ok: false,
          code: "validation",
          message: "Слишком большой объём данных.",
        },
        { status: 400 }
      );
    }
  } catch {
    return Response.json(
      {
        ok: false,
        code: "validation",
        message: "Некорректные данные формы.",
      },
      { status: 400 }
    );
  }

  const result = await createLead(body, {
    rateLimitKey: rateLimitKey(request),
  });

  if (!result.ok) {
    const status =
      result.code === "validation"
        ? 400
        : result.code === "rate_limit"
          ? 429
          : result.code === "disabled"
            ? 403
            : 500;
    return Response.json(result, { status });
  }

  return Response.json(result, { status: 200 });
}
