import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Sparkles,
  Calendar,
  MessageCircle,
  HandHeart,
  QrCode,
  Globe,
  CreditCard,
  Radio,
  Bell,
  ShieldCheck,
  Star,
  Quote,
  Smartphone,
  Users,
  TrendingUp,
  Heart,
  BookOpen,
  X,
} from "lucide-react";
import heroBg from "@/assets/landing-hero-cathedral.jpg";
import appMockup from "@/assets/landing-app-mockup.jpg";
import community from "@/assets/landing-community.jpg";
import { MARKETING_TIERS } from "@/lib/marketing-tiers";
import { WhatsAppFab } from "@/components/whatsapp-fab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "suaigreja — a plataforma que conecta sua comunidade" },
      {
        name: "description",
        content:
          "Agenda, eventos, pedidos de oração, visitantes e site próprio para a sua igreja. Tudo em um só lugar, em minutos. 7 dias grátis, sem cartão.",
      },
      { property: "og:title", content: "suaigreja — a plataforma da sua comunidade" },
      {
        property: "og:description",
        content: "Organização, evangelização e crescimento em uma plataforma elegante e simples.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showExitOffer, setShowExitOffer] = useState(false);
  const [exitDismissed, setExitDismissed] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  // Pop-up de saída — dispara quando o mouse sai pelo topo da janela.
  useEffect(() => {
    if (exitDismissed) return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) setShowExitOffer(true);
    };
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, [exitDismissed]);

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.012_85)] text-ink font-sans antialiased overflow-x-hidden selection:bg-gold/30 selection:text-foreground">
      {/* Soft ambient glow layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] rounded-full bg-gold/10 blur-[140px]" />
        <div className="absolute top-[40%] -left-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.85_0.08_85)]/40 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[oklch(0.98_0.012_85)]/80 border-b border-ink/8">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-[0_4px_20px_-4px_oklch(0.82_0.13_82_/_0.5)]">
              <Sparkles className="h-4 w-4 text-ink" strokeWidth={2.5} />
            </div>
            <span className="tracking-tight">suaigreja</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm text-ink/60">
            <a href="#funcionalidades" className="px-3 py-2 hover:text-ink transition">Recursos</a>
            <a href="#beneficios" className="px-3 py-2 hover:text-ink transition">Benefícios</a>
            <a href="#planos" className="px-3 py-2 hover:text-ink transition">Planos</a>
            <a href="#depoimentos" className="px-3 py-2 hover:text-ink transition">Comunidade</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-ink/70 hover:text-ink hover:bg-ink/5">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="bg-gold text-ink hover:bg-gold-soft shadow-[0_4px_20px_-4px_oklch(0.82_0.13_82_/_0.5)]">
              <Link to="/login">Começar 7 dias grátis <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBg}
            alt=""
            width={1920}
            height={1280}
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.98_0.012_85)]/30 via-[oklch(0.98_0.012_85)]/70 to-[oklch(0.98_0.012_85)]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-32 lg:pb-32 grid lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 backdrop-blur px-3.5 py-1.5 text-xs text-gold-soft mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              Nova era da sua comunidade começa aqui
            </div>

            <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[1.02] text-ink">
              A plataforma que <span className="italic text-gold">conecta</span><br />
              sua comunidade <br className="hidden sm:block" />
              <span className="text-ink/70">em um só lugar.</span>
            </h1>

            <p className="mt-7 text-lg sm:text-xl text-ink/65 max-w-xl leading-relaxed font-light">
              Agenda, eventos, pedidos de oração, visitantes e um site próprio —
              tudo pronto em minutos. Organize, evangelize e veja sua igreja crescer
              com uma plataforma feita com fé e cuidado.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 text-base bg-gold text-ink hover:bg-gold-soft shadow-[0_10px_40px_-10px_oklch(0.82_0.13_82_/_0.6)] transition-all hover:translate-y-[-1px]"
              >
                <Link to="/login">Começar 7 dias grátis <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-7 text-base border-ink/15 bg-ink/5 text-ink hover:bg-ink/10 hover:text-ink backdrop-blur"
              >
                <a href="#funcionalidades">Ver como funciona</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 text-xs text-ink/55">
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gold" /> Sem cartão de crédito</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gold" /> Cancele quando quiser</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gold" /> Suporte humano</div>
            </div>
          </div>

          {/* Mockup with glass frame */}
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-gold/20 via-transparent to-[oklch(0.85_0.08_85)]/30 rounded-[2rem] blur-3xl" aria-hidden />
            <div className="relative rounded-2xl border border-ink/10 bg-ink/[0.03] backdrop-blur-xl p-3 shadow-[0_30px_80px_-20px_oklch(0_0_0/0.6)]">
              <img
                src={appMockup}
                alt="Painel suaigreja com agenda, eventos e comunidade"
                width={1600}
                height={1200}
                className="rounded-xl w-full"
              />
              {/* Floating glass badges */}
              <div className="hidden sm:flex absolute -left-6 top-1/3 items-center gap-3 rounded-2xl border border-ink/10 bg-white/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
                <div className="h-9 w-9 rounded-xl bg-gold/15 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-gold" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-ink/55">Missa de domingo</div>
                  <div className="text-sm text-ink font-medium">+ 248 inscritos</div>
                </div>
              </div>
              <div className="hidden sm:flex absolute -right-4 bottom-8 items-center gap-3 rounded-2xl border border-ink/10 bg-white/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
                <div className="h-9 w-9 rounded-xl bg-gold/15 flex items-center justify-center">
                  <HandHeart className="h-4 w-4 text-gold" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-ink/55">Pedidos hoje</div>
                  <div className="text-sm text-ink font-medium">37 orações recebidas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* trust strip */}
        <div className="border-y border-ink/8 bg-ink/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs uppercase tracking-[0.2em] text-ink/45">
            <span>+ de 1.200 comunidades</span>
            <span className="hidden sm:inline">•</span>
            <span>Católica · Evangélica · Adventista</span>
            <span className="hidden sm:inline">•</span>
            <span>100% em português</span>
            <span className="hidden sm:inline">•</span>
            <span>Dados seguros no Brasil</span>
          </div>
        </div>

        {/* MARQUEE de módulos */}
        <div className="border-b border-ink/8 bg-ink/[0.015] overflow-hidden">
          <div className="flex gap-12 py-5 whitespace-nowrap animate-[marquee_40s_linear_infinite] text-sm font-light text-ink/50">
            {Array.from({ length: 2 }).map((_, dup) => (
              <div key={dup} className="flex gap-12 shrink-0">
                {[
                  "Agenda inteligente",
                  "Site próprio",
                  "Pedidos de oração",
                  "Visitantes com QR Code",
                  "Inscrições com Pix",
                  "Transmissões ao vivo",
                  "WhatsApp integrado",
                  "Notícias e galeria",
                  "Doações e campanhas",
                  "Multi-congregação",
                  "Notificações automáticas",
                  "LGPD e backup diário",
                ].map((m) => (
                  <span key={m} className="flex items-center gap-3">
                    <span className="h-1 w-1 rounded-full bg-gold" />
                    {m}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-6">o problema</div>
        <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]">
          Sua igreja ainda organiza tudo <br className="hidden sm:block" />
          <span className="italic text-ink/55">em grupos de WhatsApp?</span>
        </h2>
        <p className="mt-6 text-lg text-ink/60 max-w-2xl mx-auto font-light leading-relaxed">
          Avisos perdidos, eventos esquecidos, pedidos de oração espalhados em
          mensagens, visitantes que vêm uma vez e não voltam. A sua missão é grande
          demais para depender de planilhas, papel e mensagens soltas.
        </p>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">a solução</div>
          <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]">
            Tudo o que sua comunidade <br className="hidden sm:block" />
            precisa, <span className="italic text-gold">com simplicidade</span>.
          </h2>
          <p className="mt-5 text-ink/60 font-light text-lg">
            Uma plataforma única para organizar a vida da igreja e aproximar o fiel.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Calendar, title: "Agenda inteligente", desc: "Calendário mensal com missas, cultos e celebrações. Editou, todo mundo vê." },
            { icon: Globe, title: "Site próprio (Hub)", desc: "Endereço público suaigreja.top/sua-igreja com tudo agregado automaticamente." },
            { icon: HandHeart, title: "Pedidos de oração", desc: "Receba pedidos, modere e ore pela sua comunidade. Tudo organizado." },
            { icon: QrCode, title: "Visitantes por QR Code", desc: "Crie laços com quem chega pela primeira vez e acompanhe o crescimento." },
            { icon: CreditCard, title: "Inscrições com Pix", desc: "Eventos pagos? Receba inscrições e pagamentos sem complicação." },
            { icon: Radio, title: "Transmissões ao vivo", desc: "Integre YouTube e Facebook Live diretamente no site da sua igreja." },
            { icon: MessageCircle, title: "WhatsApp integrado", desc: "Lembretes e compartilhamento em um clique. Conecte com o canal da sua gente." },
            { icon: Bell, title: "Notificações automáticas", desc: "Avise da próxima celebração sem precisar copiar e colar." },
            { icon: ShieldCheck, title: "Seguro e privado", desc: "Backup automático, infraestrutura na nuvem, dados sempre seus." },
          ].map((f, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-ink/10 bg-ink/[0.02] p-7 hover:bg-ink/[0.04] hover:border-gold/20 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="text-ink font-medium text-base">{f.title}</h3>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed font-light">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS EMOCIONAIS - split section */}
      <section id="beneficios" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={community} alt="" width={1600} height={1000} loading="lazy" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.98_0.012_85)] via-[oklch(0.98_0.012_85)]/80 to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">por que importa</div>
            <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]">
              Não é sobre tecnologia. <br />
              É sobre <span className="italic text-gold">presença</span>.
            </h2>
            <p className="mt-6 text-ink/65 text-lg font-light leading-relaxed">
              Cada minuto que sua equipe gasta organizando é um minuto a menos servindo.
              A gente cuida da estrutura para que vocês cuidem das pessoas.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Mais presença nas celebrações",
                "Mais participação da comunidade",
                "Menos trabalho manual da equipe",
                "Mais vínculo com novos fiéis",
                "Mais tempo para o que importa",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-ink/80">
                  <div className="h-6 w-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-gold" />
                  </div>
                  <span className="font-light text-lg">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">simples assim</div>
          <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink">
            Em 3 passos, no <span className="italic text-gold">ar</span>.
          </h2>
        </div>
        <ol className="grid md:grid-cols-3 gap-5">
          {[
            { n: "01", t: "Crie sua conta", d: "Em 1 minuto seu painel está pronto, já com os tipos de celebração da sua tradição." },
            { n: "02", t: "Monte a agenda", d: "Cadastre locais, eventos e o pedacinho da identidade da sua comunidade." },
            { n: "03", t: "Compartilhe com todos", d: "Use o site pronto ou cole o código no seu existente. A comunidade encontra tudo." },
          ].map((s) => (
            <li key={s.n} className="relative rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 hover:border-gold/20 transition">
              <div className="font-display text-5xl font-light text-gold/40">{s.n}</div>
              <h3 className="mt-6 text-xl text-ink font-medium">{s.t}</h3>
              <p className="mt-2 text-ink/60 font-light leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* KPIs — VEJA EM TEMPO REAL */}
      <section className="relative py-24 border-y border-ink/8 bg-gradient-to-b from-ink/[0.02] to-transparent">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">prova visual</div>
            <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]">
              Decida com <span className="italic text-gold">dados</span>, não com achismo.
            </h2>
            <p className="mt-5 text-ink/60 font-light text-lg">
              Indicadores claros, em tempo real, para acompanhar a vida da sua comunidade.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Users, v: "1.247", l: "Membros ativos", d: "Famílias e ministérios organizados." },
              { icon: HandHeart, v: "+ 320", l: "Orações respondidas no mês", d: "Pedidos acompanhados pela liderança." },
              { icon: TrendingUp, v: "R$ 48,2K", l: "Entradas do mês", d: "Dízimos, ofertas e campanhas." },
              { icon: Calendar, v: "32", l: "Eventos ativos", d: "Cultos, conferências e encontros." },
              { icon: QrCode, v: "164", l: "Visitantes no mês", d: "Acolhidos via QR Code na entrada." },
              { icon: Radio, v: "12", l: "Transmissões ao vivo", d: "Cultos e celebrações online." },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl border border-ink/10 bg-white/60 backdrop-blur p-6 hover:border-gold/30 transition">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center">
                    <k.icon className="h-4 w-4 text-gold" />
                  </div>
                  <div className="font-display text-3xl text-ink font-light tracking-tight">{k.v}</div>
                </div>
                <div className="mt-4 text-ink text-sm font-medium">{k.l}</div>
                <div className="text-ink/55 text-xs mt-1 font-light">{k.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">comunidade</div>
          <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink">
            Líderes que já <span className="italic text-gold">transformaram</span> suas comunidades.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              q: "Em duas semanas tínhamos toda a paróquia conectada. A agenda no site mudou completamente a participação nas missas de semana.",
              n: "Pe. Marcos Almeida",
              r: "Paróquia São José — Belo Horizonte / MG",
            },
            {
              q: "Os pedidos de oração nos aproximaram dos fiéis. Hoje conheço pelo nome quem antes era um visitante esporádico.",
              n: "Pra. Daniela Souza",
              r: "Comunidade Cristã Vida — Campos dos Goytacazes / RJ",
            },
            {
              q: "Tudo numa única plataforma, com cara profissional. Era exatamente o que faltava para a nossa igreja crescer com organização.",
              n: "Diác. Roberto Lima",
              r: "Igreja Batista Central — Salvador / BA",
            },
          ].map((t) => (
            <figure
              key={t.n}
              className="relative rounded-2xl border border-ink/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8"
            >
              <Quote className="h-7 w-7 text-gold/40" />
              <blockquote className="mt-4 text-ink/80 font-light leading-relaxed text-[1.02rem]">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-7 pt-5 border-t border-ink/10">
                <div className="flex items-center gap-1 text-gold mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <div className="text-ink text-sm font-medium">{t.n}</div>
                <div className="text-ink/55 text-xs mt-0.5">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">planos</div>
          <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink">
            Escolha como sua igreja <br />
            quer estar <span className="italic text-gold">presente</span>.
          </h2>
          <p className="mt-5 text-ink/60 font-light text-lg">7 dias grátis. Sem cartão. Sem compromisso.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {MARKETING_TIERS.map((tier) => {
            const isHi = !!tier.highlight;
            return (
              <div
                key={tier.id}
                className={
                  isHi
                    ? "relative rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/[0.08] to-ink/[0.02] p-8 shadow-[0_30px_80px_-20px_oklch(0.82_0.13_82_/_0.25)] flex flex-col"
                    : "relative rounded-3xl border border-ink/10 bg-ink/[0.02] p-8 flex flex-col"
                }
              >
                {isHi && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] bg-gold text-ink px-3 py-1 rounded-full font-medium">
                    Mais escolhido
                  </div>
                )}
                <div className="text-xs uppercase tracking-[0.2em] text-ink/55">{tier.name}</div>
                <h3 className="mt-3 font-display text-2xl text-ink font-normal">{tier.tagline}</h3>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-light text-ink">
                    {tier.priceLabel.split("/")[0]}
                  </span>
                  <span className="text-ink/55 text-sm">/{tier.priceLabel.split("/")[1]}</span>
                </div>
                <div className="h-px bg-ink/8 my-6" />
                <ul className="space-y-3 text-sm flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-ink/75 font-light">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isHi ? "text-gold" : "text-ink/45"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={
                    isHi
                      ? "mt-7 h-11 bg-gold text-ink hover:bg-gold-soft shadow-[0_8px_30px_-8px_oklch(0.82_0.13_82_/_0.5)]"
                      : "mt-7 h-11 bg-ink/10 text-ink hover:bg-ink/15 border border-ink/10"
                  }
                >
                  <Link to="/login">Começar 7 dias grátis</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">dúvidas frequentes</div>
          <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-ink">
            Tudo o que você precisa <span className="italic text-gold">saber</span>.
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "Funciona para igrejas católicas e evangélicas?", a: "Sim. No primeiro acesso você escolhe a tradição (Católica, Evangélica, Adventista, Batista, Pentecostal ou Comunidade) e o painel é configurado com os tipos de celebração da sua identidade." },
            { q: "Preciso saber programar para usar?", a: "Não. Tudo é feito por menus simples. Em poucos minutos sua agenda e seu site público estão no ar — sem instalar nada, sem código." },
            { q: "Posso cancelar quando quiser?", a: "Pode. Sem multa, sem fidelidade. Você usa enquanto fizer sentido para a sua comunidade." },
            { q: "Como funciona o site da minha igreja?", a: "Você ganha um endereço público (ex: suaigreja.top/sua-paroquia) que reúne agenda, eventos, pedidos de oração, visitantes, redes sociais e Pix — pronto para compartilhar." },
            { q: "Recebo doações por Pix?", a: "Sim. Basta cadastrar sua chave Pix nas configurações e ela aparece no site com botão de copiar." },
            { q: "Meus dados ficam seguros?", a: "Sim. Toda a estrutura é hospedada em servidores brasileiros, com backup automático e em conformidade com a LGPD." },
          ].map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-ink/10 bg-ink/[0.02] p-6 hover:border-gold/30 transition open:border-gold/30 open:bg-ink/[0.04]"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-ink text-base">
                <span>{item.q}</span>
                <span className="ml-4 h-7 w-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-lg leading-none transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-ink/65 font-light leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        {/* INSTALE COMO APP */}
        <div className="mb-12 rounded-[2rem] border border-ink/10 bg-ink/[0.02] p-10 sm:p-14 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5">
              <Smartphone className="h-3.5 w-3.5" /> aplicativo
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-ink leading-[1.1]">
              Instale no celular e acesse <span className="italic text-gold">com um toque</span>.
            </h3>
            <p className="mt-5 text-ink/65 font-light leading-relaxed">
              A plataforma funciona como aplicativo: abra no navegador do celular,
              toque em "Adicionar à tela inicial" e pronto — acesso direto, sem loja,
              sem download pesado, sempre atualizado.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/55">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gold" /> iPhone e Android</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gold" /> Sempre atualizado</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gold" /> Funciona offline básico</span>
            </div>
          </div>
          <div className="relative h-56 sm:h-72">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/20 via-transparent to-gold/10 blur-2xl" />
            <div className="relative h-full flex items-center justify-center">
              <div className="rounded-[2rem] border border-ink/10 bg-white shadow-2xl p-3 w-44 sm:w-52">
                <img src="/icon-512.png" alt="Ícone do app suaigreja" width={512} height={512} loading="lazy" className="rounded-2xl w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-br from-[oklch(0.96_0.02_85)] via-[oklch(0.94_0.025_82)] to-[oklch(0.92_0.03_80)] p-12 sm:p-20 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-gold/15 blur-[120px]" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1.5 text-xs text-gold-soft mb-7">
            <Sparkles className="h-3 w-3" /> Comece hoje
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-light tracking-tight text-ink leading-[1.05]">
            Sua comunidade no ar <br />
            em <span className="italic text-gold">menos de 5 minutos</span>.
          </h2>
          <p className="mt-6 text-ink/65 max-w-xl mx-auto font-light text-lg">
            Tecnologia com propósito. Beleza com fé. A plataforma que sua igreja merece.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-8 text-base bg-gold text-ink hover:bg-gold-soft shadow-[0_10px_40px_-10px_oklch(0.82_0.13_82_/_0.6)]">
              <Link to="/login">Criar minha conta grátis <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-ink/15 bg-ink/5 text-ink hover:bg-ink/10 hover:text-ink">
              <a href="#planos">Ver planos</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink/8">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <BookOpen className="h-5 w-5 text-gold/70 mx-auto mb-4" />
          <p className="font-display text-xl sm:text-2xl text-ink/75 font-light italic leading-relaxed">
            "Tudo o que fizerdes, fazei-o de todo o coração, como para o Senhor."
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-ink/45">Colossenses 3:23</p>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink/45">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display text-ink/70">suaigreja</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-ink transition">Entrar</Link>
            <a href="#planos" className="hover:text-ink transition">Planos</a>
            <a href="#funcionalidades" className="hover:text-ink transition">Recursos</a>
          </div>
        </div>
      </footer>

      {/* Widget flutuante de WhatsApp */}
      <WhatsAppFab />

      {/* Pop-up de saída — oferta de 7 dias grátis */}
      {showExitOffer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-ink/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative max-w-md w-full rounded-3xl border border-gold/30 bg-[oklch(0.98_0.012_85)] p-8 sm:p-10 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)]">
            <button
              onClick={() => { setShowExitOffer(false); setExitDismissed(true); }}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink/55 hover:text-ink hover:bg-ink/5 transition"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold-soft mb-5">
              <Heart className="h-3 w-3" /> espere um momento
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-light text-ink leading-tight">
              Antes de sair, <span className="italic text-gold">experimente 7 dias grátis</span>.
            </h3>
            <p className="mt-4 text-ink/65 font-light text-sm leading-relaxed">
              Sem cartão, sem compromisso. Veja em minutos como sua igreja pode ficar
              mais organizada, presente e conectada.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 w-full h-12 bg-gold text-ink hover:bg-gold-soft shadow-[0_10px_40px_-10px_oklch(0.82_0.13_82_/_0.6)]"
              onClick={() => { setShowExitOffer(false); setExitDismissed(true); }}
            >
              <Link to="/login">Quero meus 7 dias grátis <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <button
              onClick={() => { setShowExitOffer(false); setExitDismissed(true); }}
              className="mt-4 text-xs text-ink/45 hover:text-ink/70 transition"
            >
              Não, obrigado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
