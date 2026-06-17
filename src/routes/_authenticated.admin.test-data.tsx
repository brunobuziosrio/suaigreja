import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin, generateTestData, deleteTestData, countTestData } from "@/lib/admin.functions";
import { listAllAccounts } from "@/lib/admin.functions";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  BarChart3,
  Users,
  Calendar,
  Gift,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/test-data")({
  component: TestDataPage,
});

function TestDataPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const listAccounts = useServerFn(listAllAccounts);
  const genTestData = useServerFn(generateTestData);
  const delTestData = useServerFn(deleteTestData);
  const countTest = useServerFn(countTestData);
  const qc = useQueryClient();

  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });

  const isAdmin = !!adminCheck?.isAdmin;

  const { data: accounts } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => listAccounts(),
    enabled: isAdmin,
  });

  const { data: testDataCounts } = useQuery({
    queryKey: ["test-data-count"],
    queryFn: () => countTest(),
    refetchInterval: 5000,
  });

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const genMut = useMutation({
    mutationFn: (accountId: string) => genTestData({ data: { account_id: accountId } }),
    onSuccess: (result) => {
      toast.success(
        `${result.created.members} membros, ${result.created.donations} doações e ${result.created.events} eventos criados!`
      );
      qc.invalidateQueries({ queryKey: ["test-data-count"] });
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });

  const delMut = useMutation({
    mutationFn: (accountId: string) => delTestData({ data: { account_id: accountId } }),
    onSuccess: (result) => {
      toast.success(`${result.total} registros de teste deletados!`);
      qc.invalidateQueries({ queryKey: ["test-data-count"] });
      setSelectedAccount(null);
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });

  if (checking) {
    return (
      <AppShell>
        <div className="w-full text-sm text-muted-foreground">Verificando permissões…</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h1 className="text-xl font-semibold">Área restrita</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Esta página é só para administradores da plataforma.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" /> Gerenciar Dados de Teste
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gere dados de teste completos para testar painéis, relatórios e funcionalidades.
          </p>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <AlertDescription className="text-amber-800">
            <strong>Importante:</strong> Todos os dados gerados aqui são marcados como "dados de teste" e podem
            ser deletados em lote. Use esta ferramenta apenas em ambientes de desenvolvimento.
          </AlertDescription>
        </Alert>

        {testDataCounts && testDataCounts.total > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Dados de Teste Detectados</p>
                <p className="text-sm text-blue-700 mt-1">
                  Você tem <strong>{testDataCounts.total}</strong> registros de teste na sua conta:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  {testDataCounts.counts.members > 0 && (
                    <li>• {testDataCounts.counts.members} membros</li>
                  )}
                  {testDataCounts.counts.donations > 0 && (
                    <li>• {testDataCounts.counts.donations} doações</li>
                  )}
                  {testDataCounts.counts.events > 0 && (
                    <li>• {testDataCounts.counts.events} eventos</li>
                  )}
                  {testDataCounts.counts.ebd_classes > 0 && (
                    <li>• {testDataCounts.counts.ebd_classes} classes de EBD</li>
                  )}
                  {testDataCounts.counts.ebd_enrollments > 0 && (
                    <li>• {testDataCounts.counts.ebd_enrollments} inscrições</li>
                  )}
                  {testDataCounts.counts.ebd_attendance > 0 && (
                    <li>• {testDataCounts.counts.ebd_attendance} registros de frequência</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Selecione uma Conta</h2>
          <div className="space-y-3">
            {accounts && accounts.length > 0 ? (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedAccount === account.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-outline hover:border-outline-strong"
                  }`}
                  onClick={() => setSelectedAccount(account.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{account.brand_title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{account.email}</p>
                      <p className="text-xs text-muted-foreground font-mono">{account.site_id}</p>
                    </div>
                    <Badge variant={account.subscription_status === "active" ? "default" : "secondary"}>
                      {account.subscription_status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma conta disponível.</p>
            )}
          </div>
        </Card>

        {selectedAccount && (
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Gerar Dados de Teste
            </h2>
            <p className="text-sm text-ink-secondary mb-4">
              Isso criará dados de teste robustos incluindo:
            </p>
            <ul className="text-sm text-ink-secondary space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4" /> 30 membros com diferentes roles (membros, visitantes, líderes, pastores)
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> 30 eventos (cultos, EBD, células, transmissões, devocionais)
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4" /> 30 doações com valores variados
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> 5 classes de EBD com inscrições e frequência
              </li>
            </ul>
            <Button
              onClick={() => genMut.mutate(selectedAccount)}
              disabled={genMut.isPending}
              className="w-full bg-forest hover:bg-forest-hover text-white"
            >
              {genMut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando dados…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Gerar Dados de Teste
                </>
              )}
            </Button>
          </Card>
        )}

        {selectedAccount && testDataCounts && testDataCounts.total > 0 && (
          <Card className="p-6 border-2 border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Limpar Todos os Dados de Teste
            </h2>
            <Alert className="mb-4 border-coral-soft bg-surface-elevated">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Atenção:</strong> Esta ação vai deletar permanentemente todos os {testDataCounts.total} registros
                de teste da sua conta. Esta ação <strong>não pode ser desfeita</strong>.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => {
                if (window.confirm("Tem certeza? Vai deletar todos os dados de teste. Esta ação não pode ser desfeita.")) {
                  delMut.mutate(selectedAccount);
                }
              }}
              disabled={delMut.isPending}
              variant="destructive"
              className="w-full"
            >
              {delMut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar Todos os Dados de Teste ({testDataCounts.total} registros)
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
