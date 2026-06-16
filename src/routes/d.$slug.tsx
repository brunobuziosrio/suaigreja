import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicDonations, generateDonationPix } from "@/lib/donations.functions";
import { getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandCoins, Copy, Check, Heart, Loader2 } from "lucide-react";
import { PublicHero } from "@/components/public-hero";
import { toast } from "sonner";

export const Route = createFileRoute("/d/$slug")({
  loader: async ({ params }) => {
    const [data, chrome] = await Promise.all([
      getPublicDonations({ data: { slug: params.slug } }),
      getHubChrome({ data: { siteId: params.slug } }),
    ]);
    if (!data) throw notFound();
    return { ...data, chrome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Doações — ${loaderData?.account?.brand_title ?? "Igreja"}` },
      { name: "description", content: `Contribua com ${loaderData?.account?.brand_title ?? "nossa igreja"} via Pix.` },
    ],
  }),
  component: PublicDonationsPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <HandCoins className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-semibold mt-3">Página de doações não encontrada</h1>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p className="text-sm text-destructive">{error.message}</p>
    </div>
  ),
});

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PublicDonationsPage() {
  const { account, campaigns, chrome } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const primary = account?.primary_color || "#467da5";
  const [active, setActive] = useState<any>(null);

  const body = (
    <div className="pb-16 bg-background">
      <PublicHero
        color={primary}
        title="Doações"
        subtitle={account?.brand_title}
        icon={<Heart className="h-10 w-10" />}
        slug={slug}
      />

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">Sua oferta transforma vidas</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Contribua de forma rápida e segura via Pix. O valor cai direto na conta da igreja, sem taxas.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <Card className="p-10 text-center">
            <HandCoins className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma campanha ativa no momento.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {campaigns.map((c: any) => (
              <Card
                key={c.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActive(c)}
              >
                {c.image_url && <img src={c.image_url} alt="" className="w-full h-40 object-cover" />}
                <div className="p-4">
                  {c.featured && (
                    <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full" style={{ background: `${primary}20`, color: primary }}>
                      Destaque
                    </span>
                  )}
                  <h3 className="font-semibold mt-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{c.description}</p>
                  {c.goal_cents > 0 && (
                    <p className="text-xs mt-2 text-muted-foreground">Meta: <strong className="text-foreground">{fmtBRL(c.goal_cents)}</strong></p>
                  )}
                  <Button className="w-full mt-3" style={{ background: primary }}>
                    <HandCoins className="h-4 w-4 mr-2" /> Contribuir agora
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground mt-10">
          "Cada um dê conforme determinou em seu coração, não com tristeza ou por obrigação, pois Deus ama quem dá com alegria." — 2 Coríntios 9:7
        </p>
      </main>

      {active && <PixDialog campaign={active} slug={slug} primary={primary} onClose={() => setActive(null)} />}
    </div>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{body}</HubChrome>;
  return <div className="min-h-screen bg-background">{body}</div>;
}

function PixDialog({ campaign, slug, primary, onClose }: { campaign: any; slug: string; primary: string; onClose: () => void }) {
  const gen = useServerFn(generateDonationPix);
  const [amountBRL, setAmountBRL] = useState("");
  const [pix, setPix] = useState<{ payload: string; qrDataUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const mut = useMutation({
    mutationFn: async (cents: number | undefined) =>
      gen({ data: { slug, id: campaign.id, amountCents: cents } }),
    onSuccess: (d: any) => setPix(d),
    onError: (e: any) => toast.error(e?.message || "Erro ao gerar Pix"),
  });

  function generate(presetCents?: number) {
    let cents = presetCents;
    if (!cents && amountBRL) cents = Math.round(parseFloat(amountBRL.replace(",", ".")) * 100);
    mut.mutate(cents);
  }

  function copyPayload() {
    if (!pix) return;
    navigator.clipboard.writeText(pix.payload).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
      toast.success("Código Pix copiado");
    });
  }

  const suggested = (campaign.suggested_amounts_cents as number[] | undefined) ?? [];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {campaign.image_url && (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="block w-full group"
            aria-label="Ampliar imagem da campanha"
          >
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full max-h-56 object-cover group-hover:opacity-95 transition"
            />
          </button>
        )}
        <div className="p-5 border-b">
          <h3 className="font-semibold">{campaign.title}</h3>
          <p className="text-xs text-muted-foreground">
            Doação via Pix{campaign.image_url ? " · toque na imagem para ampliar" : ""}
          </p>
          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{campaign.description}</p>
          )}
        </div>

        {!pix ? (
          <div className="p-5 space-y-4">
            {suggested.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Valor sugerido</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggested.map((c) => (
                    <Button key={c} variant="outline" onClick={() => generate(c)} disabled={mut.isPending}>
                      {fmtBRL(c)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-2">Outro valor (R$)</p>
              <div className="flex gap-2">
                <Input
                  type="number" min={1} step="0.01" placeholder="50,00"
                  value={amountBRL} onChange={(e) => setAmountBRL(e.target.value)}
                />
                <Button onClick={() => generate()} disabled={mut.isPending || !amountBRL} style={{ background: primary }}>
                  {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Pix"}
                </Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => generate()} disabled={mut.isPending}>
              Doar valor livre (você digita no banco)
            </Button>
          </div>
        ) : (
          <div className="p-5 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">Aponte a câmera do seu banco para o QR Code abaixo</p>
            <img src={pix.qrDataUrl} alt="QR Pix" className="w-56 h-56 mx-auto rounded-lg border" />
            <div className="bg-muted/40 border rounded-lg p-3 text-left">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Pix Copia e Cola</p>
              <p className="text-[11px] font-mono break-all">{pix.payload}</p>
            </div>
            <Button className="w-full" style={{ background: primary }} onClick={copyPayload}>
              {copied ? <><Check className="h-4 w-4 mr-2" />Copiado!</> : <><Copy className="h-4 w-4 mr-2" />Copiar código Pix</>}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { setPix(null); }}>
              Doar outro valor
            </Button>
          </div>
        )}

        <div className="p-4 border-t flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>

      {lightbox && campaign.image_url && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
        >
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute top-4 right-4 text-white/90 hover:text-white text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}