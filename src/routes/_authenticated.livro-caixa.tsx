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
import { listCongregations } from "@/lib/congregations.functions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, Plus, Trash2, Loader2, TrendingUp, TrendingDown, Scale,
  FileSpreadsheet, Download, Upload, CheckCircle2, FileDown, Printer,
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
  congregation_id: string;
  payment_method: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const empty: Form = {
  entry_type: "income", category: "", description: "", amount: "",
  entry_date: today(), contributor_name: "", congregation_id: "", payment_method: "", notes: "",
};

const PAYMENT_METHODS = ["pix", "dinheiro", "cartao", "transferencia", "outro"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];
type TypeFilter = "todos" | "income" | "expense";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão", transferencia: "Transferência", outro: "Outro",
};

function normalizePaymentMethod(value: string): PaymentMethod | null {
  return PAYMENT_METHODS.includes(value as PaymentMethod) ? (value as PaymentMethod) : null;
}

function isTypeFilter(value: string): value is TypeFilter {
  return value === "todos" || value === "income" || value === "expense";
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CSV_TEMPLATE_HEADERS = ["tipo", "categoria", "descricao", "valor", "data", "contribuinte", "unidade", "forma_pagamento", "observacoes"];
const CSV_TEMPLATE_SAMPLE_ROW = ["entrada", "Dízimo", "Dízimo mensal", "150.00", "2026-07-01", "João da Silva", "Sede", "pix", ""];

function downloadTemplate() {
  const csv = buildCsv(CSV_TEMPLATE_HEADERS, [CSV_TEMPLATE_SAMPLE_ROW]);
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-importacao-lancamentos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadFilteredEntries(entries: FinancialEntryRow[]) {
  const headers = [
    "data",
    "tipo",
    "categoria",
    "unidade",
    "descricao",
    "contribuinte",
    "forma_pagamento",
    "valor",
    "observacoes",
  ];
  const rows = entries.map((entry) => [
    entry.entry_date,
    entry.entry_type === "income" ? "entrada" : "saída",
    entry.category,
    entry.congregations?.name ?? "",
    entry.description ?? "",
    entry.contributor_name ?? "",
    entry.payment_method ?? "",
    (entry.amount_cents / 100).toFixed(2),
    entry.notes ?? "",
  ]);
  const csv = buildCsv(headers, rows);
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `livro-caixa-filtrado-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadReportCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = buildCsv(headers, rows);
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ManagementReport = {
  categories: Array<{ category: string; income: number; expense: number; balance: number }>;
  months: Array<{ month: string; income: number; expense: number; balance: number }>;
  units: Array<{ unit: string; income: number; expense: number; balance: number }>;
  expenseRatio: number;
};

function printFinancialReport(
  totals: { income: number; expense: number; balance: number },
  report: ManagementReport,
  filters: { search: string; type: string; category: string; unit: string; dateFrom: string; dateTo: string },
) {
  const w = window.open("", "_blank", "width=980,height=720");
  if (!w) return;
  const rows = (items: Array<{ label: string; income: number; expense: number; balance: number }>) => items.map((row) => `
    <tr>
      <td>${escapeHtml(row.label)}</td>
      <td>${fmt(row.income)}</td>
      <td>${fmt(row.expense)}</td>
      <td class="${row.balance >= 0 ? "pos" : "neg"}">${fmt(row.balance)}</td>
    </tr>
  `).join("");
  const filterLines = [
    filters.search ? `Busca: ${filters.search}` : "",
    filters.type !== "todos" ? `Tipo: ${filters.type === "income" ? "Entradas" : "Saídas"}` : "",
    filters.category !== "todas" ? `Categoria: ${filters.category}` : "",
    filters.unit !== "todas" ? `Unidade: ${filters.unit === "sem-unidade" ? "Sem unidade" : filters.unit}` : "",
    filters.dateFrom ? `De: ${new Date(`${filters.dateFrom}T00:00:00`).toLocaleDateString("pt-BR")}` : "",
    filters.dateTo ? `Até: ${new Date(`${filters.dateTo}T00:00:00`).toLocaleDateString("pt-BR")}` : "",
  ].filter(Boolean).join(" · ") || "Sem filtros aplicados";

  w.document.write(`<!doctype html><html><head><meta charset="utf-8" />
    <title>Relatório financeiro</title>
    <style>
      body{font-family:Arial,sans-serif;color:#111827;margin:32px}
      header{border-bottom:1px solid #d1d5db;margin-bottom:24px;padding-bottom:16px}
      h1{font-size:24px;margin:0 0 6px} h2{font-size:16px;margin:26px 0 10px}
      .muted{color:#6b7280;font-size:12px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}
      .card{border:1px solid #d1d5db;border-radius:8px;padding:14px}.label{font-size:11px;color:#6b7280;text-transform:uppercase}.value{font-size:18px;font-weight:700;margin-top:4px}
      table{width:100%;border-collapse:collapse;margin-bottom:12px}th,td{border-bottom:1px solid #e5e7eb;padding:8px;text-align:right;font-size:12px}th:first-child,td:first-child{text-align:left}
      .pos{color:#047857}.neg{color:#dc2626}@media print{body{margin:18mm}.no-print{display:none}}
    </style></head><body>
    <header>
      <h1>Relatório financeiro - Livro Caixa</h1>
      <div class="muted">Gerado em ${new Date().toLocaleString("pt-BR")} · ${escapeHtml(filterLines)}</div>
    </header>
    <div class="cards">
      <div class="card"><div class="label">Entradas</div><div class="value pos">${fmt(totals.income)}</div></div>
      <div class="card"><div class="label">Saídas</div><div class="value neg">${fmt(totals.expense)}</div></div>
      <div class="card"><div class="label">Saldo</div><div class="value ${totals.balance >= 0 ? "pos" : "neg"}">${fmt(totals.balance)}</div></div>
    </div>
    <h2>DRE simplificada</h2>
    <table><tbody>
      <tr><td>Receita bruta</td><td class="pos">${fmt(totals.income)}</td></tr>
      <tr><td>Despesas operacionais</td><td class="neg">-${fmt(totals.expense)}</td></tr>
      <tr><td>Resultado líquido</td><td class="${totals.balance >= 0 ? "pos" : "neg"}">${fmt(totals.balance)}</td></tr>
      <tr><td>Despesas sobre entradas</td><td>${report.expenseRatio}%</td></tr>
    </tbody></table>
    <h2>Balancete por categoria</h2>
    <table><thead><tr><th>Categoria</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>${rows(report.categories.map((r) => ({ label: r.category, ...r })))}</tbody></table>
    <h2>Resumo mensal</h2>
    <table><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>${rows(report.months.map((r) => ({ label: r.month, ...r })))}</tbody></table>
    <h2>Resultado por unidade</h2>
    <table><thead><tr><th>Unidade</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>${rows(report.units.map((r) => ({ label: r.unit, ...r })))}</tbody></table>
    <script>window.print()</script>
    </body></html>`);
  w.document.close();
}

function FinancialEntriesPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listFinancialEntries);
  const save = useServerFn(upsertFinancialEntry);
  const remove = useServerFn(deleteFinancialEntry);
  const runImport = useServerFn(importFinancialEntriesCsv);
  const fetchCongregations = useServerFn(listCongregations);

  const { data: entries = [], isLoading } = useQuery({ queryKey: ["financial-entries"], queryFn: () => fetchList() });
  const { data: congregations = [] } = useQuery({ queryKey: ["congregations"], queryFn: () => fetchCongregations() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);
  const csvFileInput = useRef<HTMLInputElement>(null);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [congregationFilter, setCongregationFilter] = useState("todas");
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
        congregation_id: form.congregation_id || null,
        payment_method: normalizePaymentMethod(form.payment_method),
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
      if (congregationFilter !== "todas" && (e.congregation_id || "sem-unidade") !== congregationFilter) return false;
      if (dateFrom && e.entry_date < dateFrom) return false;
      if (dateTo && e.entry_date > dateTo) return false;
      if (q) {
        const haystack = [e.category, e.description, e.contributor_name, e.congregations?.name, e.notes].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, typeFilter, categoryFilter, congregationFilter, search, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const income = filtered.filter((e) => e.entry_type === "income").reduce((acc, e) => acc + e.amount_cents, 0);
    const expense = filtered.filter((e) => e.entry_type === "expense").reduce((acc, e) => acc + e.amount_cents, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const managementReport = useMemo(() => {
    const byCategory = new Map<string, { category: string; income: number; expense: number; balance: number }>();
    const byMonth = new Map<string, { month: string; income: number; expense: number; balance: number }>();
    const byUnit = new Map<string, { unit: string; income: number; expense: number; balance: number }>();

    for (const entry of filtered) {
      const category = byCategory.get(entry.category) ?? { category: entry.category, income: 0, expense: 0, balance: 0 };
      const monthKey = entry.entry_date.slice(0, 7);
      const month = byMonth.get(monthKey) ?? { month: monthKey, income: 0, expense: 0, balance: 0 };
      const unitName = entry.congregations?.name ?? "Sem unidade";
      const unit = byUnit.get(unitName) ?? { unit: unitName, income: 0, expense: 0, balance: 0 };

      if (entry.entry_type === "income") {
        category.income += entry.amount_cents;
        month.income += entry.amount_cents;
        unit.income += entry.amount_cents;
      } else {
        category.expense += entry.amount_cents;
        month.expense += entry.amount_cents;
        unit.expense += entry.amount_cents;
      }

      category.balance = category.income - category.expense;
      month.balance = month.income - month.expense;
      unit.balance = unit.income - unit.expense;
      byCategory.set(entry.category, category);
      byMonth.set(monthKey, month);
      byUnit.set(unitName, unit);
    }

    return {
      categories: Array.from(byCategory.values())
        .sort((a, b) => (b.income + b.expense) - (a.income + a.expense)),
      months: Array.from(byMonth.values()).sort((a, b) => b.month.localeCompare(a.month)),
      units: Array.from(byUnit.values()).sort((a, b) => (b.income + b.expense) - (a.income + a.expense)),
      expenseRatio: totals.income > 0 ? Math.round((totals.expense / totals.income) * 100) : 0,
    };
  }, [filtered, totals.income, totals.expense]);

  const exportDre = () => downloadReportCsv("dre-simplificada", ["linha", "valor"], [
    ["Receita bruta", (totals.income / 100).toFixed(2)],
    ["Despesas operacionais", (totals.expense / 100).toFixed(2)],
    ["Resultado liquido", (totals.balance / 100).toFixed(2)],
    ["Despesas sobre entradas (%)", managementReport.expenseRatio],
  ]);

  const exportCategories = () => downloadReportCsv("balancete-por-categoria", ["categoria", "entradas", "saidas", "saldo"], managementReport.categories.map((row) => [
    row.category,
    (row.income / 100).toFixed(2),
    (row.expense / 100).toFixed(2),
    (row.balance / 100).toFixed(2),
  ]));

  const exportMonths = () => downloadReportCsv("resumo-mensal", ["mes", "entradas", "saidas", "saldo"], managementReport.months.map((row) => [
    row.month,
    (row.income / 100).toFixed(2),
    (row.expense / 100).toFixed(2),
    (row.balance / 100).toFixed(2),
  ]));

  const exportUnits = () => downloadReportCsv("resultado-por-unidade", ["unidade", "entradas", "saidas", "saldo"], managementReport.units.map((row) => [
    row.unit,
    (row.income / 100).toFixed(2),
    (row.expense / 100).toFixed(2),
    (row.balance / 100).toFixed(2),
  ]));

  const printReport = () => printFinancialReport(totals, managementReport, {
    search,
    type: typeFilter,
    category: categoryFilter,
    unit: congregationFilter === "todas" || congregationFilter === "sem-unidade"
      ? congregationFilter
      : congregations.find((c) => c.id === congregationFilter)?.name ?? congregationFilter,
    dateFrom,
    dateTo,
  });

  const openEdit = (e: FinancialEntryRow) => {
    setForm({
      id: e.id, entry_type: e.entry_type, category: e.category, description: e.description ?? "",
      amount: String(e.amount_cents / 100), entry_date: e.entry_date, contributor_name: e.contributor_name ?? "",
      payment_method: e.payment_method ?? "", congregation_id: e.congregation_id ?? "", notes: e.notes ?? "",
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
            <Button variant="outline" onClick={() => downloadFilteredEntries(filtered)}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
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
                    <Label>Unidade / congregação</Label>
                    <Select value={form.congregation_id || "_"} onValueChange={(v) => setForm({ ...form, congregation_id: v === "_" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="Sem unidade" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_">Sem unidade</SelectItem>
                        {congregations.filter((c) => c.active).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <Input placeholder="Buscar categoria, descrição, contribuinte…" value={search} onChange={(e) => setSearch(e.target.value)} className="lg:col-span-2" />
            <Select value={typeFilter} onValueChange={(value) => isTypeFilter(value) && setTypeFilter(value)}>
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
            <Select value={congregationFilter} onValueChange={setCongregationFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas unidades</SelectItem>
                <SelectItem value="sem-unidade">Sem unidade</SelectItem>
                {congregations.filter((c) => c.active).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="De" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="Até" />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="lancamentos" className="w-full">
          <div className="mb-4 flex items-center justify-between gap-3">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="lancamentos">Lançamentos ({filtered.length})</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={printReport}>
              <Printer className="h-3.5 w-3.5 mr-1.5" />Imprimir relatório
            </Button>
          </div>

          <TabsContent value="relatorios" className="mt-0">
            <div className="grid gap-4 mb-4 xl:grid-cols-[1.05fr_.95fr]">
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">DRE simplificada</p>
                    <h2 className="mt-1 text-lg font-semibold">Resultado do período filtrado</h2>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportDre}>
                    <FileDown className="h-3.5 w-3.5 mr-1.5" />CSV
                  </Button>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span>Receita bruta</span>
                    <span className="font-medium text-emerald-600">{fmt(totals.income)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span>Despesas operacionais</span>
                    <span className="font-medium text-red-600">-{fmt(totals.expense)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium">Resultado líquido</span>
                    <span className={`text-lg font-semibold ${totals.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(totals.balance)}</span>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    As despesas representam {managementReport.expenseRatio}% das entradas neste recorte.
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Balancete</p>
                    <h2 className="mt-1 text-lg font-semibold">Categorias principais</h2>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportCategories} disabled={managementReport.categories.length === 0}>
                    <FileDown className="h-3.5 w-3.5 mr-1.5" />CSV
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  {managementReport.categories.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Sem dados para o recorte atual.</p>
                  ) : managementReport.categories.slice(0, 8).map((row) => (
                    <div key={row.category} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-3 text-sm">
                      <span className="min-w-0 truncate font-medium">{row.category}</span>
                      <span className={row.balance >= 0 ? "text-emerald-600" : "text-red-600"}>{fmt(row.balance)}</span>
                      <span className="text-xs text-muted-foreground">Entradas {fmt(row.income)}</span>
                      <span className="text-xs text-muted-foreground">Saídas {fmt(row.expense)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {managementReport.months.length > 0 && (
              <Card className="mb-4 overflow-hidden">
                <div className="flex items-start justify-between gap-3 border-b p-4">
                  <div>
                    <h2 className="font-semibold">Resumo mensal</h2>
                    <p className="text-sm text-muted-foreground">Últimos meses presentes no recorte filtrado.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportMonths}>
                    <FileDown className="h-3.5 w-3.5 mr-1.5" />CSV
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead className="text-right">Entradas</TableHead>
                        <TableHead className="text-right">Saídas</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {managementReport.months.slice(0, 6).map((row) => (
                        <TableRow key={row.month}>
                          <TableCell>{new Date(`${row.month}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</TableCell>
                          <TableCell className="text-right text-emerald-600">{fmt(row.income)}</TableCell>
                          <TableCell className="text-right text-red-600">{fmt(row.expense)}</TableCell>
                          <TableCell className={`text-right font-medium ${row.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(row.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {managementReport.units.length > 0 && (
              <Card className="mb-4 overflow-hidden">
                <div className="flex items-start justify-between gap-3 border-b p-4">
                  <div>
                    <h2 className="font-semibold">Resultado por unidade</h2>
                    <p className="text-sm text-muted-foreground">Entradas, saídas e saldo separados por congregação.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportUnits}>
                    <FileDown className="h-3.5 w-3.5 mr-1.5" />CSV
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="text-right">Entradas</TableHead>
                        <TableHead className="text-right">Saídas</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {managementReport.units.map((row) => (
                        <TableRow key={row.unit}>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell className="text-right text-emerald-600">{fmt(row.income)}</TableCell>
                          <TableCell className="text-right text-red-600">{fmt(row.expense)}</TableCell>
                          <TableCell className={`text-right font-medium ${row.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(row.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lancamentos" className="mt-0">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">Nenhum lançamento encontrado.</TableCell></TableRow>
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
                    <TableCell className="text-sm text-muted-foreground">{e.congregations?.name || "—"}</TableCell>
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
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
