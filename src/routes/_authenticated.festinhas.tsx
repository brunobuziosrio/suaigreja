import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ChefHat, CircleDollarSign, Clock3, QrCode, Store, UsersRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/festinhas")({ component: FestinhasPage });

const steps = [
  ["01", "Crie a festa", "Defina data, causa, barracas e responsáveis."],
  ["02", "Monte os cardápios", "Produtos, combos, estoque e preços por barraca."],
  ["03", "Venda sem fila", "Venda rápida no balcão e pedido por QR Code."],
  ["04", "Feche com clareza", "Resultado por barraca, operador e forma de pagamento."],
];

function FestinhasPage() {
  return <AppShell><main className="mx-auto w-full max-w-6xl space-y-7 pb-12">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#19352d] px-6 py-8 text-[#fff8e7] shadow-xl sm:px-10 sm:py-11">
      <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[36px] border-[#f7b955]/20" />
      <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-[#d95d3e]/20 blur-2xl" />
      <div className="relative max-w-3xl">
        <Badge className="border-0 bg-[#f7b955] text-[#19352d] hover:bg-[#f7b955]">NOVO · MÓDULO EM BETA</Badge>
        <div className="mt-5 flex items-start gap-4"><span className="rounded-2xl bg-white/10 p-3"><ChefHat className="h-7 w-7 text-[#f7b955]" /></span><div><h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Festinhas que rendem mais e dão menos trabalho.</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-[#fff8e7]/75">Uma central de operação para barracas, pedidos, caixa e prestação de contas — pensada para a sua próxima festa, quermesse ou evento beneficente.</p></div></div>
        <div className="mt-7 flex flex-wrap gap-3"><Button asChild className="bg-[#f7b955] text-[#19352d] hover:bg-[#ffd37c]"><Link to="/billing">Ativar módulo mensal <ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"><a href="/festejo" target="_blank" rel="noreferrer">Ver vitrine pública</a></Button></div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
      [Store, "Barracas organizadas", "Cardápio e responsável em um só lugar"],
      [QrCode, "Pedido por QR", "Menos fila no caixa e na retirada"],
      [CircleDollarSign, "Caixa auditável", "Cada venda ligada ao operador"],
      [UsersRound, "Feito para voluntários", "Fluxo simples em qualquer celular"],
    ].map(([Icon, title, text]) => { const I = Icon as typeof Store; return <Card key={title as string} className="border-stone-200 p-5 shadow-sm"><I className="h-5 w-5 text-[#c85b3f]" /><h2 className="mt-4 font-semibold">{title as string}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text as string}</p></Card>})}</section>

    <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <Card className="border-stone-200 p-6"><div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-[#c85b3f]" /><h2 className="font-display text-xl font-semibold">Como vai funcionar</h2></div><div className="mt-6 grid gap-5 sm:grid-cols-2">{steps.map(([number, title, detail]) => <div key={number} className="flex gap-3"><span className="font-display text-2xl font-semibold text-[#d8a132]">{number}</span><div><h3 className="font-medium">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div></div>)}</div></Card>
      <Card className="border-[#e4c97a] bg-[#fff9e9] p-6"><p className="text-xs font-semibold tracking-[.16em] text-[#9c7020]">PRIMEIRA ETAPA</p><h2 className="mt-2 font-display text-2xl font-semibold text-[#3d301b]">Prepare sua operação antes da próxima festa.</h2><p className="mt-3 text-sm leading-relaxed text-[#675d49]">Estamos estruturando o módulo com foco em venda de balcão, estoque simples, fechamento por barraca e relatórios transparentes.</p><div className="mt-6 rounded-xl bg-white/70 p-4 text-sm text-[#675d49]"><strong className="block text-[#3d301b]">Assinatura mensal</strong>Disponível como adicional à assinatura do sistema. Sem plano anual neste momento.</div></Card>
    </section>
  </main></AppShell>;
}
