type SupabaseRpcClient = {
  rpc: any;
};

type CreditResult = {
  ok: boolean;
  balance: number | null;
  ledger_id: string | null;
  reason: string;
};

function normalizeRpcResult(data: unknown): CreditResult {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    return { ok: false, balance: null, ledger_id: null, reason: "empty_result" };
  }
  const value = row as Partial<CreditResult>;
  return {
    ok: value.ok === true,
    balance: typeof value.balance === "number" ? value.balance : null,
    ledger_id: typeof value.ledger_id === "string" ? value.ledger_id : null,
    reason: typeof value.reason === "string" ? value.reason : "unknown",
  };
}

export function createWhatsappMessageId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function reserveWhatsappCredits({
  supabase,
  accountId,
  messageId,
  costCredits = 1,
  idempotencyKey,
  metadata,
}: {
  supabase: SupabaseRpcClient;
  accountId: string;
  messageId: string;
  costCredits?: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase.rpc("reserve_whatsapp_credits", {
    p_account_id: accountId,
    p_message_id: messageId,
    p_cost: costCredits,
    p_idempotency_key: idempotencyKey,
    p_metadata: metadata ?? {},
  });
  if (error) throw new Error(error.message);
  return normalizeRpcResult(data);
}

export async function refundWhatsappMessageCredits({
  supabase,
  accountId,
  messageId,
  idempotencyKey,
  metadata,
}: {
  supabase: SupabaseRpcClient;
  accountId: string;
  messageId: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase.rpc("refund_whatsapp_message_credits", {
    p_account_id: accountId,
    p_message_id: messageId,
    p_idempotency_key: idempotencyKey,
    p_metadata: metadata ?? {},
  });
  if (error) throw new Error(error.message);
  return normalizeRpcResult(data);
}
