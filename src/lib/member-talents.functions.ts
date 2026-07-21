import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireModuleAccess } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

const TalentInput = z.object({
  member_id: z.string().uuid(),
  profession: z.string().max(120).nullable(),
  skills: z.array(z.string().trim().min(1).max(60)).max(20),
  languages: z.array(z.string().trim().min(1).max(40)).max(12),
  availability: z.string().max(300).nullable(),
  notes: z.string().max(800).nullable(),
  contact_visible: z.boolean(),
});

export type MemberTalent = z.infer<typeof TalentInput> & {
  id: string;
  member_name: string;
  phone: string | null;
  photo_url: string | null;
};

export const listMemberTalents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/membros");
    await requirePermission(context, "members", "view");
    const { data, error } = await context.supabase
      .from("member_talents" as never)
      .select("id,member_id,profession,skills,languages,availability,notes,contact_visible,members!inner(full_name,phone,photo_url)")
      .eq("account_id", accountId)
      .order("profession");
    if (error) throw new Error(error.message);
    return ((data ?? []) as Array<Record<string, unknown>>).map((talent) => {
      const member = talent.members as { full_name: string; phone: string | null; photo_url: string | null };
      return {
        ...talent,
        member_name: member.full_name,
        phone: talent.contact_visible ? member.phone : null,
        photo_url: member.photo_url,
      } as MemberTalent;
    });
  });

export const saveMemberTalent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => TalentInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/membros");
    await requirePermission(context, "members", "manage");
    const { data: member, error: memberError } = await context.supabase.from("members").select("id").eq("id", data.member_id).eq("account_id", accountId).maybeSingle();
    if (memberError) throw new Error(memberError.message);
    if (!member) throw new Error("Participante não encontrado nesta comunidade.");
    const { error } = await context.supabase
      .from("member_talents" as never)
      .upsert({ account_id: accountId, ...data } as never, { onConflict: "account_id,member_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
