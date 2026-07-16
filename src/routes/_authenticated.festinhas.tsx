import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createFestaProduct, createFestaStall, createFestinha, listFestinhas } from "@/lib/festinhas.functions";
import { ChefHat, CircleDollarSign, Plus, Store, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/festinhas")({ component: FestinhasPage });
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

function FestinhasPage() {
  const queryClient = useQueryClient();
  const list = useServerFn(listFestinhas); const createEvent = useServerFn(createFestinha); const createStall = useServerFn(createFestaStall); const createProduct = useServerFn(createFestaProduct);
  const { data: events = [], isLoading } = useQuery({ queryKey: ["festinhas"], queryFn: () => list() });
  const [eventName, setEventName] = useState(""); const [eventDate, setEventDate] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["festinhas"] });
  const eventMut = useMutation({ mutationFn: () => createEvent({ data: { name: eventName, starts_at: eventDate ? new Date(eventDate).toISOString() : null } }), onSuccess: () => { setEventName(""); setEventDate(""); refresh(); toast.success("Festinha criada. Agora monte as barracas."); }, onError: (e: Error) => toast.error(e.message) });
  const stallMut = useMutation({ mutationFn: (data: { festa_event_id: string; name: string }) => createStall({ data }), onSuccess: () => { refresh(); toast.success("Barraca adicionada"); }, onError: (e: Error) => toast.error(e.message) });
  const productMut = useMutation({ mutationFn: (data: { festa_stall_id: string; name: string; price_cents: number; stock_quantity: number | null }) => createProduct({ data }), onSuccess: () => { refresh(); toast.success("Produto adicionado"); }, onError: (e: Error) => toast.error(e.message) });

  return <AppShell><main className="mx-auto w-full max-w-6xl space-y-7 pb-12">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#19352d] px-6 py-8 text-[#fff8e7] shadow-xl sm:px-10"><div className="absolute -right-20 -top-24 size-72 rounded-full border-[34px] border-[#f7b955]/20" /><div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Badge className="border-0 bg-[#f7b955] text-[#19352d]">OPERAÇÃO DE EVENTOS</Badge><h1 className="mt-4 flex items-center gap-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl"><ChefHat className="h-8 w-8 text-[#f7b955]" />Festinhas e barracas</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#fff8e7]/75">Crie a edição, organize o cardápio por barraca e deixe a base pronta para o caixa.</p></div><div className="rounded-2xl bg-white/10 px-5 py-3 text-sm"><strong className="block text-[#f7b955]">MVP operacional</strong>Configuração de evento e cardápio</div></div></section>
    <Card className="border-[#e4c97a] bg-[#fff9e9] p-5"><div className="flex items-center gap-2"><Plus className="h-5 w-5 text-[#c85b3f]" /><h2 className="font-display text-lg font-semibold">Nova edição</h2></div><div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]"><div><Label htmlFor="festa-name">Nome do evento</Label><Input id="festa-name" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Ex.: Festa Comunitária de Julho" /></div><div><Label htmlFor="festa-date">Data e hora</Label><Input id="festa-date" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></div><Button className="self-end bg-[#19352d] hover:bg-[#26493d]" disabled={!eventName.trim() || eventMut.isPending} onClick={() => eventMut.mutate()}>Criar edição</Button></div></Card>
    {isLoading && <p className="py-10 text-center text-sm text-muted-foreground">Carregando operação…</p>}
    {!isLoading && events.length === 0 && <Card className="border-dashed p-12 text-center"><UtensilsCrossed className="mx-auto h-9 w-9 text-[#c85b3f]" /><h2 className="mt-4 font-display text-xl font-semibold">Comece pela próxima festinha</h2><p className="mt-2 text-sm text-muted-foreground">Crie uma edição para adicionar suas barracas e produtos.</p></Card>}
    <div className="space-y-5">{events.map((event) => <EventCard key={event.id} event={event} addStall={(name) => stallMut.mutate({ festa_event_id: event.id, name })} addProduct={(stallId, name, price, stock) => productMut.mutate({ festa_stall_id: stallId, name, price_cents: price, stock_quantity: stock })} busy={stallMut.isPending || productMut.isPending} />)}</div>
  </main></AppShell>;
}

function EventCard({ event, addStall, addProduct, busy }: { event: Awaited<ReturnType<typeof listFestinhas>>[number]; addStall: (name: string) => void; addProduct: (stall: string, name: string, price: number, stock: number | null) => void; busy: boolean }) {
  const [stallName, setStallName] = useState("");
  return <Card className="overflow-hidden border-stone-200"><header className="flex flex-wrap items-center justify-between gap-3 border-b bg-stone-50 px-5 py-4"><div><div className="flex items-center gap-2"><h2 className="font-display text-xl font-semibold">{event.name}</h2><Badge variant="outline">Rascunho</Badge></div><p className="mt-1 text-xs text-muted-foreground">{event.starts_at ? new Date(event.starts_at).toLocaleString("pt-BR") : "Data ainda não definida"} · {event.stalls.length} barraca(s)</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><CircleDollarSign className="h-4 w-4" />Vendas em breve</div></header><div className="p-5"><div className="grid gap-4 lg:grid-cols-2">{event.stalls.map((stall) => <StallCard key={stall.id} stall={stall} addProduct={addProduct} busy={busy} />)}</div><div className="mt-5 flex max-w-md gap-2"><Input value={stallName} onChange={(e) => setStallName(e.target.value)} placeholder="Nome da nova barraca" /><Button variant="outline" disabled={!stallName.trim() || busy} onClick={() => { addStall(stallName); setStallName(""); }}><Store className="mr-1.5 h-4 w-4" />Adicionar</Button></div></div></Card>;
}

function StallCard({ stall, addProduct, busy }: { stall: Awaited<ReturnType<typeof listFestinhas>>[number]["stalls"][number]; addProduct: (stall: string, name: string, price: number, stock: number | null) => void; busy: boolean }) {
  const [name, setName] = useState(""); const [price, setPrice] = useState(""); const [stock, setStock] = useState("");
  return <section className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">{stall.name}</h3><Badge variant={stall.active ? "success" : "outline"}>{stall.active ? "Ativa" : "Pausada"}</Badge></div><div className="mt-4 space-y-2">{stall.products.map((product) => <div key={product.id} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm"><span>{product.name}</span><span className="font-medium">{money(product.price_cents)}{product.stock_quantity !== null && <small className="ml-1 text-muted-foreground">· {product.stock_quantity} un.</small>}</span></div>)}{stall.products.length === 0 && <p className="py-2 text-sm text-muted-foreground">Nenhum produto cadastrado.</p>}</div><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_90px_80px_auto]"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Produto" /><Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="R$" /><Input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" placeholder="Estoque" /><Button size="sm" disabled={!name.trim() || !price || busy} onClick={() => { addProduct(stall.id, name, Math.round(Number(price.replace(",", ".")) * 100), stock ? Number(stock) : null); setName(""); setPrice(""); setStock(""); }}>Salvar</Button></div></section>;
}
