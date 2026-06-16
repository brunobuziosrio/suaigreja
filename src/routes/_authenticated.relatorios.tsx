import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Users2, Calendar, GraduationCap } from "lucide-react";
import { getEbdMonthly, getCheckinMonthly, getSmallGroupsReport } from "@/lib/reports.functions";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: ReportsPage,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{error.message}</div>,
});

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((v) => {
      const s = String(v ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(";"))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Presença, frequência e ranking de células — com exportação CSV.</p>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <Label className="text-xs">Mês</Label>
              <select
                className="block h-9 rounded-md border bg-background px-2 text-sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleDateString("pt-BR", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Ano</Label>
              <Input
                type="number"
                className="h-9 w-24"
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || now.getFullYear())}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="ebd" className="w-full">
          <TabsList>
            <TabsTrigger value="ebd"><GraduationCap className="h-4 w-4 mr-1" />EBD</TabsTrigger>
            <TabsTrigger value="cultos"><Calendar className="h-4 w-4 mr-1" />Cultos</TabsTrigger>
            <TabsTrigger value="celulas"><Users2 className="h-4 w-4 mr-1" />Células</TabsTrigger>
          </TabsList>

          <TabsContent value="ebd" className="mt-4">
            <EbdReport year={year} month={month} />
          </TabsContent>
          <TabsContent value="cultos" className="mt-4">
            <CheckinReport year={year} month={month} />
          </TabsContent>
          <TabsContent value="celulas" className="mt-4">
            <SmallGroupsReport />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function EbdReport({ year, month }: { year: number; month: number }) {
  const fn = useServerFn(getEbdMonthly);
  const { data, isLoading } = useQuery({
    queryKey: ["ebd-monthly", year, month],
    queryFn: () => fn({ data: { year, month } }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!data || data.classes.length === 0)
    return <p className="text-sm text-muted-foreground">Sem registros de frequência neste mês.</p>;

  const totalPresent = data.classes.reduce((s, c) => s + c.present, 0);
  const totalRecs = data.classes.reduce((s, c) => s + c.total, 0);
  const overallRate = totalRecs ? Math.round((totalPresent / totalRecs) * 100) : 0;

  const exportCsv = () => {
    const rows: (string | number)[][] = [["Turma", "Aluno", "Presenças", "Total chamadas", "Frequência %"]];
    for (const c of data.classes) {
      for (const m of c.members) {
        rows.push([c.class_name, m.name, m.present, m.total, m.rate]);
      }
    }
    downloadCsv(`ebd-${year}-${String(month).padStart(2, "0")}.csv`, rows);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Turmas com registros" value={data.classes.length} />
        <KpiCard label="Chamadas no mês" value={totalRecs} />
        <KpiCard label="Frequência geral" value={`${overallRate}%`} icon={<TrendingUp className="h-4 w-4" />} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Exportar CSV</Button>
      </div>
      {data.classes.map((c) => (
        <Card key={c.class_id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{c.class_name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{c.meetings} encontros</Badge>
              <Badge>{c.rate}% frequência</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-right">Presenças</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {c.members.map((m) => (
                  <TableRow key={m.member_id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell className="text-right">{m.present}</TableCell>
                    <TableCell className="text-right">{m.total}</TableCell>
                    <TableCell className="text-right font-semibold">{m.rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CheckinReport({ year, month }: { year: number; month: number }) {
  const fn = useServerFn(getCheckinMonthly);
  const { data, isLoading } = useQuery({
    queryKey: ["checkin-monthly", year, month],
    queryFn: () => fn({ data: { year, month } }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!data || data.sessions.length === 0)
    return <p className="text-sm text-muted-foreground">Sem sessões de check-in neste mês.</p>;

  const exportCsv = () => {
    const rows: (string | number)[][] = [["Data", "Culto", "Membros", "Visitantes", "Total"]];
    for (const s of data.sessions) {
      rows.push([s.session_date, s.title, s.members, s.visitors, s.total]);
    }
    downloadCsv(`cultos-${year}-${String(month).padStart(2, "0")}.csv`, rows);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Sessões" value={data.totals.sessions} />
        <KpiCard label="Check-ins" value={data.totals.total} />
        <KpiCard label="Membros" value={data.totals.members} />
        <KpiCard label="Visitantes" value={data.totals.visitors} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Exportar CSV</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Culto</TableHead>
                <TableHead className="text-right">Membros</TableHead>
                <TableHead className="text-right">Visitantes</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{new Date(s.session_date + "T00:00").toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{s.title}</TableCell>
                  <TableCell className="text-right">{s.members}</TableCell>
                  <TableCell className="text-right">{s.visitors}</TableCell>
                  <TableCell className="text-right font-semibold">{s.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SmallGroupsReport() {
  const fn = useServerFn(getSmallGroupsReport);
  const { data, isLoading } = useQuery({
    queryKey: ["sg-report"],
    queryFn: () => fn(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!data || data.groups.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhuma célula cadastrada.</p>;

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const exportCsv = () => {
    const rows: (string | number)[][] = [["Célula", "Líder", "Telefone", "Bairro", "Dia", "Horário", "Membros", "Capacidade", "Ocupação %"]];
    for (const g of data.groups) {
      rows.push([
        g.name,
        g.leader_name ?? "",
        g.leader_phone ?? "",
        g.neighborhood ?? "",
        g.weekday != null ? weekdays[g.weekday] : "",
        g.start_time ?? "",
        g.members,
        g.capacity ?? "",
        g.occupancy ?? "",
      ]);
    }
    downloadCsv("celulas-ranking.csv", rows);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Células" value={data.totals.groups} />
        <KpiCard label="Ativas" value={data.totals.active} />
        <KpiCard label="Membros vinculados" value={data.totals.members} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Exportar CSV</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ranking de células</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Célula</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Encontro</TableHead>
                <TableHead className="text-right">Membros</TableHead>
                <TableHead className="text-right">Ocupação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.groups.map((g, i) => (
                <TableRow key={g.id}>
                  <TableCell className="font-bold">{i + 1}</TableCell>
                  <TableCell>
                    {g.name}
                    {!g.active && <Badge variant="outline" className="ml-2">inativa</Badge>}
                  </TableCell>
                  <TableCell>{g.leader_name ?? "—"}</TableCell>
                  <TableCell>{g.neighborhood ?? "—"}</TableCell>
                  <TableCell>
                    {g.weekday != null ? weekdays[g.weekday] : "—"}
                    {g.start_time ? ` ${g.start_time.slice(0, 5)}` : ""}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{g.members}</TableCell>
                  <TableCell className="text-right">{g.occupancy != null ? `${g.occupancy}%` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}