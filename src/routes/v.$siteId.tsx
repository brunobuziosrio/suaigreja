import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicVisitorForm, submitVisitor } from "@/lib/visitors.functions";
import { getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { BackToSite } from "@/components/back-to-site";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/v/$siteId")({
  loader: async ({ params }) => {
    const [d, chrome] = await Promise.all([
      getPublicVisitorForm({ data: { siteId: params.siteId } }),
      getHubChrome({ data: { siteId: params.siteId } }),
    ]);
    if (!d) throw notFound();
    return { account: d, chrome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Bem-vindo(a) à ${loaderData?.account.brand_title ?? "nossa igreja"}` },
      { name: "description", content: "Conte pra gente um pouquinho sobre você." },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p>Comunidade não encontrada.</p>
    </div>
  ),
  component: VisitorPublic,
});

const AGE_RANGES = ["Até 17", "18-25", "26-35", "36-50", "51-65", "65+"];
const HOW_FOUND = ["Convite de amigo", "Família", "Redes sociais", "Passando na rua", "YouTube/Live", "Outro"];

function VisitorPublic() {
  const { account, chrome } = Route.useLoaderData();
  const params = Route.useParams();
  const submit = useServerFn(submitVisitor);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    age_range: "",
    how_found: "",
    is_first_time: true,
    prayer_request: "",
    allow_contact: true,
  });
  const [done, setDone] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      submit({
        data: {
          siteId: params.siteId,
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          age_range: form.age_range || undefined,
          how_found: form.how_found || undefined,
          is_first_time: form.is_first_time,
          prayer_request: form.prayer_request || undefined,
          allow_contact: form.allow_contact,
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
            <Heart className="h-10 w-10 mx-auto mb-2 opacity-90" />
            <h1 className="text-2xl md:text-3xl font-bold">Que bom ter você aqui!</h1>
            <p className="opacity-90 mt-1 text-sm">{account.brand_title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {done ? (
          <Card className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color }} />
            <h2 className="text-xl font-semibold">Obrigado!</h2>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
              {account.visitor_welcome_message ||
                "Seja muito bem-vindo(a) à nossa igreja! Que alegria ter você aqui. 🙏"}
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Conte pra gente um pouquinho sobre você (leva menos de 1 minuto).
            </p>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Faixa etária</Label>
                  <Select value={form.age_range} onValueChange={(v) => setForm({ ...form, age_range: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Como conheceu?</Label>
                  <Select value={form.how_found} onValueChange={(v) => setForm({ ...form, how_found: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {HOW_FOUND.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="first"
                  checked={form.is_first_time}
                  onCheckedChange={(v) => setForm({ ...form, is_first_time: v })}
                />
                <Label htmlFor="first" className="!m-0 cursor-pointer">É minha primeira vez aqui</Label>
              </div>
              <div>
                <Label htmlFor="pr">Pedido de oração (opcional)</Label>
                <Textarea
                  id="pr"
                  rows={3}
                  value={form.prayer_request}
                  onChange={(e) => setForm({ ...form, prayer_request: e.target.value })}
                  placeholder="Pelo que podemos orar por você?"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="contact"
                  checked={form.allow_contact}
                  onCheckedChange={(v) => setForm({ ...form, allow_contact: v })}
                />
                <Label htmlFor="contact" className="!m-0 cursor-pointer text-sm">Autorizo a equipe a entrar em contato comigo</Label>
              </div>
              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: color }}
                disabled={mut.isPending}
              >
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