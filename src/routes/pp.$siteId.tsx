import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicPrivacyPolicy } from "@/lib/privacy-policy.functions";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/pp/$siteId")({
  loader: async ({ params }) => {
    const data = await getPublicPrivacyPolicy({ data: { siteId: params.siteId } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Política de Privacidade — ${loaderData?.churchName ?? "Igreja"}` }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p>Comunidade não encontrada.</p>
    </div>
  ),
  component: PublicPrivacyPolicyPage,
});

function PublicPrivacyPolicyPage() {
  const { churchName, policy } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Política de Privacidade</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{churchName}</p>

          {policy ? (
            <>
              <p className="text-xs text-muted-foreground mb-4">
                Versão {policy.version} — vigente desde {new Date(`${policy.effective_date}T00:00:00`).toLocaleDateString("pt-BR")}
              </p>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{policy.content}</div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta comunidade ainda não publicou uma política de privacidade.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
