const OPT_OUT_NOTICE = "Responda SAIR para cancelar.";

type SupabaseResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export type WhatsappConsentClient = {
  from(table: "whatsapp_opt_outs"): {
    select(columns: string): {
      eq(column: "account_id", value: string): {
        eq(column: "phone_normalized", value: string): {
          maybeSingle(): Promise<SupabaseResult<{ id: string }>>;
        };
      };
    };
  };
  rpc(
    fn: "record_whatsapp_opt_out",
    args: {
      p_account_id: string;
      p_phone: string;
      p_member_id: string | null;
      p_message_id: string | null;
      p_source: string;
      p_reason: string | null;
      p_metadata: Record<string, unknown>;
    },
  ): Promise<SupabaseResult<unknown>>;
};

export function normalizeWhatsappPhone(phone: string) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function appendWhatsappOptOutNotice(content: string) {
  const text = content.trim();
  if (/\bSAIR\b/i.test(text)) return text;
  return `${text}\n\n${OPT_OUT_NOTICE}`;
}

// Mantem o comando deliberadamente restrito para evitar que uma frase comum
// contendo a palavra "sair" cancele o consentimento por engano.
export function isWhatsappOptOutCommand(content: string | null | undefined) {
  return /^(sair|cancelar|parar|stop)$/i.test(String(content ?? "").trim());
}

export async function hasWhatsappOptedOut({
  supabase,
  accountId,
  phone,
}: {
  supabase: WhatsappConsentClient;
  accountId: string;
  phone: string;
}) {
  const phoneNormalized = normalizeWhatsappPhone(phone);
  if (!phoneNormalized) return true;

  const { data, error } = await supabase
    .from("whatsapp_opt_outs")
    .select("id")
    .eq("account_id", accountId)
    .eq("phone_normalized", phoneNormalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function recordWhatsappOptOut({
  supabase,
  accountId,
  phone,
  memberId,
  messageId,
  source,
  reason,
  metadata,
}: {
  supabase: WhatsappConsentClient;
  accountId: string;
  phone: string;
  memberId?: string | null;
  messageId?: string | null;
  source: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase.rpc("record_whatsapp_opt_out", {
    p_account_id: accountId,
    p_phone: phone,
    p_member_id: memberId ?? null,
    p_message_id: messageId ?? null,
    p_source: source,
    p_reason: reason ?? null,
    p_metadata: metadata ?? {},
  });
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data[0] : data;
}
