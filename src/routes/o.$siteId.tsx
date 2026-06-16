import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicPrayers, submitPrayerRequest, prayForRequest } from "@/lib/prayer.functions";
import { getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { BackToSite } from "@/components/back-to-site";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { HandHeart, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/o/$siteId")({
  loader: async ({ params }) => {
    const [d, chrome] = await Promise.all([
      getPublicPrayers({ data: { siteId: params.siteId } }),
      getHubChrome({ data: { siteId: params.siteId } }),
    ]);
    if (!d) throw notFound();
    return { ...d, chrome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Pedidos de Oração · ${loaderData?.account.brand_title ?? "Comunidade"}` },
      { name: "description", content: "Envie seu pedido de oração e ore por outros irmãos." },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p>Mural não encontrado.</p>
    </div>
  ),
  component: PublicPrayers,
});

function getFingerprint() {
  let fp = localStorage.getItem("prayer-fp");
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("prayer-fp", fp);
  }
  return fp;
}

function PublicPrayers() {
  const data = Route.useLoaderData();
  const params = Route.useParams();
  const submit = useServerFn(submitPrayerRequest);
  const pray = useServerFn(prayForRequest);
  const qc = useQueryClient();

  const { data: live } = useQuery({
    queryKey: ["public-prayers", params.siteId],
    queryFn: () => getPublicPrayers({ data: { siteId: params.siteId } }),
    initialData: { account: data.account, accountId: data.accountId, prayers: data.prayers },
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", is_anonymous: false });
  const [sent, setSent] = useState(false);

  const sendMut = useMutation({
    mutationFn: () => submit({ data: { siteId: params.siteId, ...form } }),
    onSuccess: () => {
      setSent(true);
      toast.success("Pedido enviado! Será publicado após aprovação.");
      setForm({ name: "", email: "", phone: "", message: "", is_anonymous: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const prayMut = useMutation({
    mutationFn: (id: string) => pray({ data: { prayerId: id, fingerprint: getFingerprint() } }),
    onSuccess: (r: { alreadyPrayed: boolean }) => {
      if (r.alreadyPrayed) toast.info("Você já orou por este pedido 🙏");
      else toast.success("Que Deus abençoe 🙏");
      qc.invalidateQueries({ queryKey: ["public-prayers", params.siteId] });
    },
  });

  const color = live!.account.primary_color || "#467da5";
  const prayers = live!.prayers;

  const body = (
    <>
      <div className="w-full py-12" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <div className="max-w-3xl mx-auto px-4 text-white">
          <BackToSite slug={params.siteId} className="mb-4" />
          <div className="text-center">
            <HandHeart className="h-10 w-10 mx-auto mb-2 opacity-90" />
            <h1 className="text-3xl md:text-4xl font-bold">Pedidos de Oração</h1>
            <p className="opacity-90 mt-1">{live!.account.brand_title}</p>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Compartilhe seu pedido</h2>
          {sent ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Obrigado! Seu pedido foi recebido e será publicado após revisão.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>Enviar outro</Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); sendMut.mutate(); }} className="space-y-3">
              <div>
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">WhatsApp (opcional)</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="msg">Seu pedido</Label>
                <Textarea id="msg" required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Pelo que devemos orar?" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="anon" checked={form.is_anonymous} onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })} />
                <Label htmlFor="anon" className="!m-0 cursor-pointer">Enviar de forma anônima</Label>
              </div>
              <Button type="submit" className="w-full text-white" style={{ backgroundColor: color }} disabled={sendMut.isPending}>
                {sendMut.isPending ? "Enviando..." : "Enviar pedido"}
              </Button>
            </form>
          )}
        </Card>
        <div>
          <h2 className="text-xl font-semibold mb-3">Mural de orações</h2>
          {prayers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Seja o primeiro a compartilhar um pedido.</p>
          ) : (
            <div className="space-y-3">
              {prayers.map((p: typeof prayers[number]) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm whitespace-pre-wrap">{p.message}</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => prayMut.mutate(p.id)} disabled={prayMut.isPending}>
                      <Heart className="h-3.5 w-3.5 mr-1" style={{ color }} />
                      Orei · {p.prayer_count}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (data.chrome) return <HubChrome account={data.chrome as any} contained={false}>{body}</HubChrome>;
  return <div className="min-h-screen bg-background">{body}</div>;
}