import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicMemberCard } from "@/lib/members.functions";
import { Button } from "@/components/ui/button";
import { Users, Printer } from "lucide-react";
import { MemberCard } from "@/components/member-card";

export const Route = createFileRoute("/c/$memberId")({
  loader: async ({ params }) => {
    const data = await getPublicMemberCard({ data: { id: params.memberId } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Carteirinha — ${loaderData?.member.full_name ?? "Membro"}` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MemberCardPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <Users className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-semibold mt-3">Carteirinha não encontrada</h1>
        <p className="text-sm text-muted-foreground mt-1">O link pode estar incorreto ou o membro foi removido.</p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div><p className="text-sm text-destructive">{error.message}</p></div>
    </div>
  ),
});

function MemberCardPage() {
  const { member, church } = Route.useLoaderData();
  const primary = church?.primary_color || "#0c2340";
  return (
    <div className="print-card-page min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:bg-white"
         style={{ background: `linear-gradient(135deg, ${primary}18, ${primary}04)` }}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body { display: block !important; }
          .print-card-wrap, .print-card-wrap * { box-shadow: none !important; }
          .print-card-page {
            min-height: auto !important;
            display: block !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .print-card-wrap {
            width: 100mm !important;
            max-width: 100mm !important;
            margin: 0 !important;
          }
          .print-card-wrap .max-w-\\[720px\\] {
            width: 100mm !important;
            max-width: 100mm !important;
            margin: 0 !important;
          }
          .print-card-wrap [style*="aspect-ratio"] {
            width: 100mm !important;
            height: 70mm !important;
            border: 0.2mm solid #d4d4d4 !important;
            border-radius: 2mm !important;
          }
        }
      `}</style>
      <div className="print-card-wrap w-full max-w-[720px]">
      <MemberCard
        member={{
          id: member.id,
          full_name: member.full_name,
          photo_url: member.photo_url,
          role: member.role,
          status: member.status,
          member_since: member.member_since,
          birth_date: member.birth_date,
          cpf: member.cpf,
          congregation: member.congregation,
        }}
        church={{
          brand_title: church?.brand_title ?? null,
          card_logo_url: church?.card_logo_url ?? church?.brand_logo_url ?? null,
          card_logo_height_px: church?.card_logo_height_px ?? 72,
          primary_color: church?.primary_color ?? null,
          card_accent_color: church?.card_accent_color ?? null,
          card_footer_text: church?.card_footer_text ?? null,
          card_title_size_px: (church as any)?.card_title_size_px ?? null,
          card_footer_size_px: (church as any)?.card_footer_size_px ?? null,
          card_field_size_px: (church as any)?.card_field_size_px ?? null,
          card_label_size_px: (church as any)?.card_label_size_px ?? null,
        }}
      />
      </div>
      <div className="mt-4 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />Imprimir
        </Button>
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground print:hidden">
        ID {member.id.slice(0, 8)} • {member.status === "ativo" ? "Membro ativo" : `Status: ${member.status}`}
      </p>
    </div>
  );
}
