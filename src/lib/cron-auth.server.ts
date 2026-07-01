export function verifyCronRequest(request: Request) {
  const expected = process.env.WHATSAPP_CRON_SECRET || process.env.CRON_SECRET;
  if (!expected) {
    return Response.json(
      { ok: false, error: "Cron secret is not configured." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-cron-secret") || "";

  if (bearer !== expected && headerSecret !== expected) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
