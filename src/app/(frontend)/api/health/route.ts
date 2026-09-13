/**
 * Lightweight liveness probe for Docker / Caddy.
 * Does not query the database and never logs secrets.
 */
export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
