const OPT_OUT_NOTICE = "Responda SAIR para cancelar.";

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

export async function hasWhatsappOptedOut({
  supabase,
  accountId,
  phone,
}: {
  supabase: any;
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
  supabase: any;
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
