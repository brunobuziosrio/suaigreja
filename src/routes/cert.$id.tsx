import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicCertificate } from "@/lib/documents.functions";
import { Card } from "@/components/ui/card";
import { BadgeCheck, FileX, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/cert/$id")({
  loader: async ({ params }) => {
    const data = await getPublicCertificate({ data: { id: params.id } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Validação de certificado — ${loaderData?.church?.brand_title ?? "Igreja"}` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CertificateValidationPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-muted/30">
      <div>
        <FileX className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-semibold mt-3">Certificado não encontrado</h1>
        <p className="text-sm text-muted-foreground mt-1">
          O link pode estar incorreto ou este documento não é um certificado numerado.
        </p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-muted/30">
      <div><p className="text-sm text-destructive">{error.message}</p></div>
    </div>
  ),
});

function CertificateValidationPage() {
  const { title, certificateNumber, issuedAt, memberName, church } = Route.useLoaderData();
  const primary = church?.primary_color || "#0c2340";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${primary}18, ${primary}04)` }}
    >
      <Card className="w-full max-w-md p-8 text-center">
        {church?.brand_logo_url && (
          <img src={church.brand_logo_url} alt="" className="h-14 mx-auto mb-4 object-contain" />
        )}
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
          <BadgeCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-lg font-semibold mt-3">Certificado válido</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Este documento foi emitido oficialmente por {church?.brand_title ?? "esta instituição"}.
        </p>

        <div className="mt-6 rounded-md border divide-y text-left text-sm">
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Número</span>
            <span className="font-mono font-medium">{certificateNumber}</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Documento</span>
            <span className="font-medium text-right">{title}</span>
          </div>
          {memberName && (
            <div className="flex items-center justify-between p-3">
              <span className="text-muted-foreground">Emitido para</span>
              <span className="font-medium text-right">{memberName}</span>
            </div>
          )}
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Data de emissão</span>
            <span className="font-medium">{new Date(`${issuedAt}T00:00:00`).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5" />
          O conteúdo completo do certificado fica somente com a instituição emissora.
        </p>
      </Card>
    </div>
  );
}
