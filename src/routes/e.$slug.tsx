import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicEventPage, registerForEvent } from "@/lib/event-pages.functions";
import { getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, CheckCircle2, Copy, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { formatCentsBRL } from "@/lib/billing-plans";
import { BackToSite } from "@/components/back-to-site";

export const Route = createFileRoute("/e/$slug")({
  loader: async ({ params }) => {
    const page = await getPublicEventPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    const accountSlug = (page as any).account_slug as string | undefined;
    const chrome = accountSlug
      ? await getHubChrome({ data: { siteId: accountSlug } })
      : null;
    return { ...page, chrome };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | Inscreva-se` },
          { name: "description", content: loaderData.description.slice(0, 155) || `Inscrição aberta para ${loaderData.title}` },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description.slice(0, 155) },
          ...(loaderData.cover_image_url ? [{ property: "og:image", content: loaderData.cover_image_url }] : []),
        ]
      : [{ title: "Evento" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Evento não encontrado</h1>
        <p className="text-sm text-muted-foreground mt-2">Verifique o link informado.</p>
      </div>
    </div>
  ),
  component: EventPage,
});

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function EventPage() {
  const page = Route.useLoaderData();
  const register = useServerFn(registerForEvent);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [imgOpen, setImgOpen] = useState(false);
  type RegResult = {
    registrationId: string;
    status: "confirmed" | "pending";
    payment: { copyPaste: string | null; qrCodeImage: string | null; amountCents: number; payUrl: string | null } | null;
  };
  const [result, setResult] = useState<RegResult | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      register({
        data: {
          slug: page.slug,
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          notes: form.notes || undefined,
        },
      }),
    onSuccess: (data: any) => {
      setResult(data);
      if (data.status === "confirmed") toast.success("Inscrição confirmada!");
      else toast.success("Inscrição registrada!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isPaid = page.price_cents > 0;
  const color = page.primary_color || "#467da5";
  const slug = (page as any).account_slug || (page as any).site_id || "";
  const brand = (page as any).brand_title || "Evento";

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: page.title, text: page.description?.slice(0, 140) || "", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado!");
      }
    } catch {
      /* user cancelled */
    }
  };

  const chrome = (page as any).chrome;
  const body = (
    <div className="min-h-screen bg-stone-50">
      {/* Header band — mesmo padrão das notícias */}
      <div
        className="relative"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
          {slug && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6">
              <BackToSite slug={slug} />
              <Link
                to="/eventos/$slug"
                params={{ slug }}
                className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" /> Todos os eventos
              </Link>
            </div>
          )}
          <p className="text-white/80 text-xs uppercase tracking-[0.3em] font-semibold inline-flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> <span className="capitalize">{formatDate(page.event_date)}</span>
          </p>
          <h1
            className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {page.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {isPaid ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/15 text-white backdrop-blur-sm">
                {formatCentsBRL(page.price_cents)}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/15 text-white backdrop-blur-sm">
                Gratuito
              </span>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-white/85 text-sm">
              Organizado por <span className="font-semibold">{brand}</span>
            </span>
            <button
              type="button"
              onClick={share}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium backdrop-blur-sm transition"
            >
              <Share2 className="h-4 w-4" /> Compartilhar
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {page.cover_image_url && (
          <button
            type="button"
            onClick={() => setImgOpen(true)}
            className="block w-full mb-10 group"
            aria-label="Ampliar imagem"
          >
            <div className="w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <img
                src={page.cover_image_url}
                alt={page.title}
                className="w-full h-auto object-contain max-h-[80vh] group-hover:opacity-95 transition"
              />
            </div>
            <span className="block text-center text-xs text-stone-500 mt-2">
              Toque na imagem para ampliar
            </span>
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-stone-800 mb-8">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-stone-500" />
            <span className="capitalize">{formatDate(page.event_date)}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-stone-500" />
            <span>
              {page.start_time.slice(0, 5)}
              {page.end_time ? ` – ${page.end_time.slice(0, 5)}` : ""}
            </span>
          </div>
          {page.location_name && (
            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 mt-0.5 text-stone-500" />
              <div>
                <div>{page.location_name}</div>
                {page.location_address && (
                  <div className="text-stone-500 text-xs">{page.location_address}</div>
                )}
              </div>
            </div>
          )}
          {page.max_attendees ? (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 text-stone-500" />
              <span>
                {page.confirmed_count} / {page.max_attendees} inscritos
              </span>
            </div>
          ) : null}
        </div>

        {page.description && (
          <div className="text-stone-800 leading-relaxed text-[17px] sm:text-lg space-y-5 whitespace-pre-wrap mb-10">
            {String(page.description).split(/\n{2,}/).map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        <div className="mt-4">
          {result ? (
            <Card className="p-6 border-2" style={{ borderColor: color }}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 mt-0.5" style={{ color }} />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {result.status === "confirmed" ? "Inscrição confirmada!" : "Quase lá!"}
                  </h2>
                  {result.status === "confirmed" ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Te esperamos no evento. Em breve você receberá mais detalhes por e-mail.
                    </p>
                  ) : result.payment ? (
                    <>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pague o PIX abaixo para confirmar sua inscrição:
                      </p>
                      {result.payment.qrCodeImage && (
                        <img src={result.payment.qrCodeImage} alt="QR Code PIX" className="mt-4 w-56 h-56 mx-auto" />
                      )}
                      {result.payment.copyPaste && (
                        <div className="mt-4">
                          <Label className="text-xs">PIX Copia e Cola</Label>
                          <div className="flex gap-2 mt-1">
                            <Input readOnly value={result.payment.copyPaste} className="font-mono text-xs" />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(result.payment!.copyPaste!);
                                toast.success("Copiado!");
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Sua inscrição foi registrada. O organizador entrará em contato.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Faça sua inscrição</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">WhatsApp / Telefone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Observação (opcional)</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: color }}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Enviando..."
                    : isPaid
                    ? `Inscrever-se · ${formatCentsBRL(page.price_cents)}`
                    : "Confirmar inscrição"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {imgOpen && page.cover_image_url && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImgOpen(false)}
        >
          <img
            src={page.cover_image_url}
            alt={page.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setImgOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl flex items-center justify-center"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{body}</HubChrome>;
  return body;
}