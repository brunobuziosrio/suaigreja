import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, ListChecks, Users, Cake, GraduationCap, HandCoins, Megaphone, Lightbulb, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccount } from "@/lib/account.functions";
import { getProfile } from "@/lib/religion-profiles";
import { listLocations } from "@/lib/locations.functions";
import { listTypes } from "@/lib/types.functions";
import { listEvents } from "@/lib/events.functions";
import { listMembers } from "@/lib/members.functions";
import { listMyDonationCampaigns } from "@/lib/donations.functions";
import { listSystemUpdates, createSuggestion } from "@/lib/feedback.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchAccount = useServerFn(getMyAccount);
  const fetchLocations = useServerFn(listLocations);
  const fetchTypes = useServerFn(listTypes);
  const fetchEvents = useServerFn(listEvents);
  const fetchMembers = useServerFn(listMembers);
  const fetchCampaigns = useServerFn(listMyDonationCampaigns);
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: () => fetchAccount() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => fetchLocations() });
  const { data: types = [] } = useQuery({ queryKey: ["types"], queryFn: () => fetchTypes() });
  const { data: members = [] } = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const { data: campaigns = [] } = useQuery({ queryKey: ["my-donations"], queryFn: () => fetchCampaigns() });
  const range = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const first = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    const lastDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const last = `${lastDate.getFullYear()}-${pad(lastDate.getMonth() + 1)}-${pad(lastDate.getDate())}`;
    return { from: first, to: last };
  }, []);
  const { data: events = [] } = useQuery({
    queryKey: ["events", range.from, range.to],
    queryFn: () => fetchEvents({ data: range }),
  });
  const profile = account ? getProfile(account.religion_profile) : null;

  const fetchUpdates = useServerFn(listSystemUpdates);
  const { data: updates = [] } = useQuery({ queryKey: ["system-updates"], queryFn: () => fetchUpdates() });

  const currentMonth = new Date().getMonth() + 1;
  const birthdays = (members as any[]).filter((m) => {
    if (!m.birth_date) return false;
    return new Date(m.birth_date + "T00:00:00").getMonth() + 1 === currentMonth;
  });
  const activeMembers = (members as any[]).filter((m) => m.status === "ativo").length;
  const activeCampaigns = (campaigns as any[]).filter((c) => c.active).length;

  const trialDays = account?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil((new Date(account.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  return (
    <AppShell>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Visao geral</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Perfil: {profile?.label} - Plano trial ({trialDays} dias restantes)
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/locations">
          <Card className="p-5 hover:border-primary transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Locais</p>
                <p className="text-2xl font-semibold">{locations.length}</p>
              </div>
            </div>
          </Card>
          </Link>
          <Link to="/types">
          <Card className="p-5 hover:border-primary transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipos</p>
                <p className="text-2xl font-semibold">{types.length}</p>
              </div>
            </div>
          </Card>
          </Link>
          <Link to="/agenda">
          <Card className="p-5 hover:border-primary transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos no mes</p>
                <p className="text-2xl font-semibold">{events.length}</p>
              </div>
            </div>
          </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <Link to="/membros">
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Membros ativos</p>
                  <p className="text-2xl font-semibold">{activeMembers}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/membros">
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-pink-500/10 text-pink-600"><Cake className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Aniversariantes do mês</p>
                  <p className="text-2xl font-semibold">{birthdays.length}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/ebd">
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-700"><GraduationCap className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Escola Bíblica</p>
                  <p className="text-2xl font-semibold">Frequência</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/hub" search={{ tab: "doacoes" } as any}>
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-700"><HandCoins className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Campanhas Pix ativas</p>
                  <p className="text-2xl font-semibold">{activeCampaigns}</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {birthdays.length > 0 && (
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Cake className="h-5 w-5 text-pink-600" />
              <h2 className="font-semibold">Aniversariantes deste mês</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {birthdays
                .sort((a, b) => new Date(a.birth_date).getDate() - new Date(b.birth_date).getDate())
                .map((m: any) => {
                  const d = new Date(m.birth_date + "T00:00:00");
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {m.full_name[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{m.full_name}</p>
                        <p className="text-xs text-muted-foreground">Dia {d.getDate()}</p>
                      </div>
                      {m.phone && (
                        <a
                          href={`https://wa.me/55${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Feliz aniversário, ${m.full_name.split(" ")[0]}! 🎉 Que Deus continue te abençoando.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <SystemUpdatesCard updates={updates as any[]} />
          <SuggestionCard />
        </div>
      </div>
    </AppShell>
  );
}

function SystemUpdatesCard({ updates }: { updates: any[] }) {
  return (
    <Card className="p-6 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Atualizações do sistema</h2>
      </div>
      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma novidade por aqui ainda. Quando publicarmos uma melhoria, ela aparece aqui.
        </p>
      ) : (
        <ul className="space-y-3 max-h-72 overflow-auto pr-1">
          {updates.map((u) => (
            <li key={u.id} className="border-l-2 border-primary/40 pl-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{u.title}</p>
                {u.version && (
                  <span className="text-[10px] font-mono uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5">
                    v{u.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-line mt-0.5">{u.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function SuggestionCard() {
  const qc = useQueryClient();
  const send = useServerFn(createSuggestion);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const mut = useMutation({
    mutationFn: () => send({ data: { title: title.trim(), message: message.trim() } }),
    onSuccess: () => {
      toast.success("Sugestão enviada. Obrigado!");
      setTitle(""); setMessage("");
      qc.invalidateQueries({ queryKey: ["my-suggestions"] });
    },
    onError: (e: any) => toast.error(e?.message || "Não foi possível enviar."),
  });

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h2 className="font-semibold">Sugerir uma melhoria</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Sua ideia ajuda a guiar nossos próximos lançamentos. Conta o que faria seu dia a dia mais fácil.
      </p>
      <div className="space-y-2">
        <Input
          placeholder="Resumo da ideia (ex.: importar membros por planilha)"
          value={title}
          maxLength={160}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Descreva sua sugestão com o máximo de detalhes."
          rows={4}
          value={message}
          maxLength={2000}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => mut.mutate()}
            disabled={mut.isPending || title.trim().length < 3 || message.trim().length < 5}
          >
            {mut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Enviar sugestão
          </Button>
        </div>
      </div>
    </Card>
  );
}