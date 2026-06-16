import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const accountId = url.searchParams.get("account_id");
        if (!accountId) return json({ error: "missing account_id" }, 400);

        const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        const paymentId =
          (payload?.data as Record<string, unknown> | undefined)?.id ??
          url.searchParams.get("data.id") ??
          url.searchParams.get("id");
        if (!paymentId) return json({ error: "missing payment id" }, 400);

        // Nunca confiar no status/valor do payload recebido — sempre confirmar
        // direto na API do Mercado Pago usando o token salvo da própria igreja.
        const { data: connection, error: connError } = await supabaseAdmin
          .from("mercadopago_connections")
          .select("access_token")
          .eq("account_id", accountId)
          .maybeSingle();
        if (connError) throw new Error(connError.message);
        if (!connection) return json({ error: "unknown account" }, 404);

        const verifyResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${connection.access_token}` },
        });
        const verified = await verifyResponse.json().catch(() => null);
        if (!verifyResponse.ok || !verified) return json({ error: "could not verify payment" }, 400);

        const status = String((verified as Record<string, unknown>).status ?? "pending");
        const dateApproved = (verified as Record<string, unknown>).date_approved as string | null;

        const { data: donation, error: donationError } = await supabaseAdmin
          .from("donations")
          .select("id, status")
          .eq("mercadopago_payment_id", String(paymentId))
          .eq("account_id", accountId)
          .maybeSingle();
        if (donationError) throw new Error(donationError.message);
        if (!donation) return json({ ok: true, ignored: true });

        const newStatus = status === "approved" ? "paid" : status === "rejected" || status === "cancelled" ? "failed" : "pending";

        const { error: updateError } = await supabaseAdmin
          .from("donations")
          .update({
            status: newStatus,
            paid_at: newStatus === "paid" ? dateApproved ?? new Date().toISOString() : null,
            webhook_payload: (payload ?? {}) as never,
          })
          .eq("id", donation.id);
        if (updateError) throw new Error(updateError.message);

        return json({ ok: true });
      },
    },
  },
});
