import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicDecisionForm, submitDecision, DECISION_KINDS } from "@/lib/decisions.functions";
import { getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { BackToSite } from "@/components/back-to-site";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HandHeart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dec/$siteId")({
  loader: async ({ params }) => {
    const [d, chrome] = await Promise.all([
      getPublicDecisionForm({ data: { siteId: params.siteId } }),
      getHubChrome({ data: { siteId: params.siteId } }),
    ]);
    if (!d) throw notFound();
    return { account: d, chrome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Fale conosco — ${loaderData?.account.brand_title ?? "nossa igreja"}` },
      { name: "description", content: "Conte pra gente o que está em seu coração." },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p>Comunidade não encontrada.</p>
    </div>
  ),
  component: DecisionPublic,
});

const KIND_OPTIONS: { value: (typeof DECISION_KINDS)[number]; label: string; hint: string }[] = [
  { value: "aceitar_jesus", label: "Quero aceitar Jesus", hint: "Dar o primeiro passo na fé" },
  { value: "voltar_igreja", label: "Quero voltar pra igreja", hint: "Retomar minha caminhada" },
  { value: "conversar", label: "Quero conversar com alguém", hint: "Preciso falar com um líder" },
  { value: "batismo", label: "Quero me batizar", hint: "Dar esse passo importante" },
  { value: "celula", label: "Quero entrar numa célula", hint: "Fazer parte de um grupo" },
  { value: "aconselhamento", label: "Preciso de aconselhamento", hint: "Um momento de escuta e oração" },
];

function DecisionPublic() {
  const { account, chrome } = Route.useLoaderData();
  const params = Route.useParams();
  const submit = useServerFn(submitDecision);

  const [kind, setKind] = useState<(typeof DECISION_KINDS)[number] | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [done, setDone] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      submit({
        data: {
          siteId: params.siteId,
          kind: kind!,
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          message: form.message || undefined,
        },
      }),
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message),
  });

  const color = account.primary_color || "#467da5";

  const body = (
    <>
      <div className="w-full py-10" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <div className="max-w-md mx-auto px-4 text-white">
          <BackToSite slug={params.siteId} className="mb-4" />
          <div className="text-center">
            <HandHeart className="h-10 w-10 mx-auto mb-2 opacity-90" />
            <h1 className="text-2xl md:text-3xl font-bold">Estamos aqui por você</h1>
            <p className="opacity-90 mt-1 text-sm">{account.brand_title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {done ? (
          <Card className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color }} />
            <h2 className="text-xl font-semibold">Recebemos seu pedido!</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Nossa equipe vai entrar em contato com você em breve. Estamos orando por você. 🙏
            </p>
          </Card>
        ) : !kind ? (
          <div className="space-y-2.5">
            <p className="text-sm text-muted-foreground mb-3">O que você gostaria de nos contar hoje?</p>
            {KIND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKind(opt.value)}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-colors hover:bg-muted/50",
                )}
              >
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.hint}</p>
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <button
              type="button"
              className="text-xs text-muted-foreground underline mb-3"
              onClick={() => setKind(null)}
            >
              ← Escolher outra opção
            </button>
            <p className="text-sm font-medium mb-4">{KIND_OPTIONS.find((o) => o.value === kind)?.label}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mut.mutate();
              }}
              className="space-y-3"
            >
              <div>
                <Label htmlFor="name">Seu nome *</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" inputMode="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">E-mail (opcional)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="msg">Quer contar mais alguma coisa? (opcional)</Label>
                <Textarea id="msg" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <Button type="submit" className="w-full text-white" style={{ backgroundColor: color }} disabled={mut.isPending}>
                {mut.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{body}</HubChrome>;
  return <div className="min-h-screen bg-background">{body}</div>;
}
