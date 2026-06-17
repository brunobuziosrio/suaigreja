import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/finances")({
  component: FinancesPage,
});

const getDonations = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("account_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

const getMembersWithDonations = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("account_id", context.userId)
      .order("full_name");

    if (error) throw new Error(error.message);
    return data ?? [];
  });

function FinancesPage() {
  const getDonationsData = createServerFn({ method: "GET" })
    .middleware([requireSupabaseAuth])
    .handler(async ({ context }) => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("account_id", context.userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    });

  const { data: donations, isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: () => getDonationsData(),
  });

  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "failed">("all");
  const [searchDonor, setSearchDonor] = useState("");

  const filtered = useMemo(() => {
    if (!donations) return [];
    return donations.filter((d) => {
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      const matchSearch =
        !searchDonor ||
        (d.donor_name ?? "").toLowerCase().includes(searchDonor.toLowerCase()) ||
        (d.donor_email ?? "").toLowerCase().includes(searchDonor.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [donations, statusFilter, searchDonor]);

  const stats = useMemo(() => {
    if (!donations) return { total: 0, paid: 0, pending: 0, failed: 0, totalValue: 0, paidValue: 0 };

    const stats = {
      total: donations.length,
      paid: donations.filter((d) => d.status === "paid").length,
      pending: donations.filter((d) => d.status === "pending").length,
      failed: donations.filter((d) => d.status === "failed").length,
      totalValue: donations.reduce((acc, d) => acc + d.amount_cents, 0) / 100,
      paidValue: donations.filter((d) => d.status === "paid").reduce((acc, d) => acc + d.amount_cents, 0) / 100,
    };
    return stats;
  }, [donations]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6" /> Finanças e Doações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe todas as doações e contribuições da sua congregação.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total de Doações</p>
                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
              </div>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Doações Pagas</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor Total Pago</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">{formatCurrency(stats.paidValue)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-semibold mt-1 text-amber-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por nome ou e-mail do doador…"
              value={searchDonor}
              onChange={(e) => setSearchDonor(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doador</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    Carregando…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma doação encontrada.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.donor_name || "Anônimo"}</TableCell>
                  <TableCell className="text-sm">{donation.donor_email || "—"}</TableCell>
                  <TableCell className="text-sm">{donation.donor_phone || "—"}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(donation.amount_cents)}</TableCell>
                  <TableCell>{getStatusBadge(donation.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(donation.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Summary */}
        {filtered.length > 0 && (
          <Card className="p-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Mostrando</p>
                <p className="text-lg font-semibold">{filtered.length} de {stats.total}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Exibido</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(filtered.reduce((acc, d) => acc + d.amount_cents, 0))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor Médio</p>
                <p className="text-lg font-semibold">
                  {filtered.length > 0
                    ? formatCurrency(filtered.reduce((acc, d) => acc + d.amount_cents, 0) / filtered.length)
                    : formatCurrency(0)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
