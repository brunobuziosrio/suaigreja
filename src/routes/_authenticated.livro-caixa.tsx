import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listFinancialEntries,
  upsertFinancialEntry,
  deleteFinancialEntry,
  importFinancialEntriesCsv,
  ENTRY_CATEGORIES,
  type FinancialEntryRow,
} from "@/lib/financial-entries.functions";
import { buildCsv } from "@/lib/csv";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Plus, Trash2, Loader2, TrendingUp, TrendingDown, Scale,
  FileSpreadsheet, Download, Upload, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/livro-caixa")({
  component: FinancialEntriesPage,
});

type Form = {
  id?: string;
  entry_type: "income" | "expense";
  category: string;
  description: string;
  amount: string;
  entry_date: string;
  contributor_name: string;
  payment_method: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const empty: Form = {
  entry_type: "income", category: "", description: "", amount: "",
  entry_date: today(), contributor_name: "", payment_method: "", notes: "",
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão", transferencia: "Transferência", outro: "Outro",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CSV_TEMPLATE_HEADERS = ["tipo", "categoria", "descricao", "valor", "data", "contribuinte", "forma_pagamento", "observacoes"];
const CSV_TEMPLATE_SAMPLE_ROW = ["entrada", "Dízimo", "Dízimo mensal", "150.00", "2026-07-01", "João da Silva", "pix", ""];

function downloadTemplate() {
  const csv = buildCsv(CSV_TEMPLATE_HEADERS, [CSV_TEMPLATE_SAMPLE_ROW]);
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-importacao-lancamentos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function FinancialEntriesPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listFinancialEntries);
  const save = useServerFn(upsertFinancialEntry);
  const remove = useServerFn(deleteFinancialEntry);
  const runImport = useServerFn(importFinancialEntriesCsv);

  const { data: entries = [], isLoading } = useQuery({ queryKey: ["financial-entries"], queryFn: () => fetchList() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);
  const csvFileInput = useRef<HTMLInputElement>(null);

  const [typeFilter, setTypeFilter] = useState<"todos" | "income" | "expense">("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["financial-entries"] });

  const upsertMut = useMutation({
    mutationFn: () => save({
      data: {
        id: form.id,
        entry_type: form.entry_type,
        category: form.category.trim(),
        description: form.description.trim() || null,
        amount_cents: Math.round(Number(form.amount.replace(",", ".")) * 100),
        entry_date: form.entry_date,
        contributor_name: form.contributor_name.trim() || null,
        payment_method: (form.payment_method || null) as any,
        notes: form.notes.trim() || null,
      },
    }),
    onSuccess: () => { invalidate(); toast.success("Lançamento salvo"); setOpen(false); setForm(empty); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Lançamento removido"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const importMut = useMutation({
    mutationFn: (csv: string) => runImport({ data: { csv } }),
    onSuccess: (result) => {
      invalidate();
      setImportResult(result);
      if (result.errors.length === 0) toast.success(`${result.created} lançamento(s) importado(s)`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleCsvFile(file: File) {
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = () => importMut.mutate(String(reader.result));
    reader.onerror = () => toast.error("Não foi possível ler o arquivo.");
    reader.readAsText(file, "utf-8");
  }

  const categories = useMemo(() => Array.from(new Set(entries.map((e) => e.category))).sort(), [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (typeFilter !== "todos" && e.entry_type !== typeFilter) return false;
      if (categoryFilter !== "todas" && e.category !== categoryFilter) return false;
      if (dateFrom && e.entry_date < dateFrom) return false;
      if (dateTo && e.entry_date > dateTo) return false;
      if (q) {
        const haystack = [e.category, e.description, e.contributor_name, e.notes].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, typeFilter, categoryFilter, search, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const income = filtered.filter((e) => e.entry_type === "income").reduce((acc, e) => acc + e.amount_cents, 0);
    const expense = filtered.filter((e) => e.entry_type === "expense").reduce((acc, e) => acc + e.amount_cents, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const openEdit = (e: FinancialEntryRow) => {
    setForm({
      id: e.id, entry_type: e.entry_type, category: e.category, description: e.description ?? "",
      amount: String(e.amount_cents / 100), entry_date: e.entry_date, contributor_name: e.contributor_name ?? "",
      payment_method: e.payment_method ?? "", notes: e.notes ?? "",
    });
    setOpen(true);
  };

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6" /> Livro Caixa
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registre entradas e saídas manuais, com filtros e totais sempre visíveis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={importOpen} onOpenChange={(o) => { setImportOpen(o); if (!o) setImportResult(null); }}>
              <DialogTrigger asChild>
                <Button variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2" />Importar CSV</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Importar lançamentos por CSV</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Importe vários lançamentos de uma vez a partir de uma planilha. Linhas sem categoria ou valor válido são ignoradas.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Baixar modelo CSV
                  </Button>
                  <input
                    ref={csvFileInput}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); e.target.value = ""; }}
                  />
                  <Button type="button" className="w-full" disabled={importMut.isPending} onClick={() => csvFileInput.current?.click()}>
                    {importMut.isPending ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Importando…</>) : (<><Upload className="h-4 w-4 mr-2" />Escolher arquivo CSV</>)}
                  </Button>
                  {importResult && (
                    <div className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {importResult.created} lançamento(s) importado(s)
                      </div>
                      {importResult.errors.length > 0 && (
                        <div className="max-h-48 overflow-y-auto rounded border bg-amber-50 dark:bg-amber-950/20 p-2 text-xs space-y-1">
                          <p className="font-medium text-amber-800 dark:text-amber-400">{importResult.errors.length} aviso(s):</p>
                          {importResult.errors.map((err, idx) => (
                            <p key={idx} className="text-amber-700 dark:text-amber-500">Linha {err.row}: {err.message}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setImportOpen(false)}>Fechar</Button></DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo lançamento</Button></DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{form.id ? "Editar lançamento" : "Novo lançamento"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v as "income" | "expense", category: "" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Entrada</SelectItem>
                          <SelectItem value="expense">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={form.category || "_"} onValueChange={(v) => setForm({ ...form, category: v === "_" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          {ENTRY_CATEGORIES[form.entry_type].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Contribuinte / Fornecedor</Label>
                      <Input value={form.contributor_name} onChange={(e) => setForm({ ...form, contributor_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Forma de pagamento</Label>
                      <Select value={form.payment_method || "_"} onValueChange={(v) => setForm({ ...form, payment_method: v === "_" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          {Object.entries(PAYMENT_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button
                    disabled={!form.category.trim() || !form.amount || Number(form.amount.replace(",", ".")) <= 0 || upsertMut.isPending}
                    onClick={() => upsertMut.mutate()}
                  >
                    {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Totais sempre visíveis sobre o resultado filtrado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Entradas</p>
                <p className="text-xl font-semibold mt-1 text-emerald-600">{fmt(totals.income)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Saídas</p>
                <p className="text-xl font-semibold mt-1 text-red-600">{fmt(totals.expense)}</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo</p>
                <p className={`text-xl font-semibold mt-1 ${totals.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(totals.balance)}</p>
              </div>
              <Scale className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input placeholder="Buscar categoria, descrição, contribuinte…" value={search} onChange={(e) => setSearch(e.target.value)} className="lg:col-span-2" />
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="income">Entradas</SelectItem>
                <SelectItem value="expense">Saídas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas categorias</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="De" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="Até" />
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Nenhum lançamento encontrado.</TableCell></TableRow>
                )}
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm whitespace-nowrap">{new Date(`${e.entry_date}T00:00:00`).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <span className={e.entry_type === "income" ? "text-emerald-600 text-sm" : "text-red-600 text-sm"}>
                        {e.entry_type === "income" ? "Entrada" : "Saída"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{e.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">{e.description || "—"}</TableCell>
                    <TableCell className="text-sm">{e.contributor_name || "—"}</TableCell>
                    <TableCell className={`text-right font-medium ${e.entry_type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                      {e.entry_type === "income" ? "+" : "-"}{fmt(e.amount_cents)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>Editar</Button>
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm("Remover este lançamento?")) deleteMut.mutate(e.id); }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
