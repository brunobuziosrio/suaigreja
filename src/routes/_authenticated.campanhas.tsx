/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, TrendingUp, Wallet, Target, DollarSign } from "lucide-react";
import { listCampaigns, upsertCampaign, deleteCampaign, getCampaignStats } from "@/lib/campaigns.functions";
import { listTithes, getTithesReport, upsertTithe, deleteTithe } from "@/lib/tithes.functions";
import { listMembers } from "@/lib/members.functions";

export const Route = createFileRoute("/_authenticated/campanhas")({
  component: CampaignsPage,
});

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  goal_amount_cents: number;
  current_amount_cents: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  pix_key: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type Tithe = {
  id: string;
  member_id: string;
  amount_cents: number;
  contributed_at: string;
  status: string;
  notes: string | null;
  members?: { full_name: string; email: string };
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function CampaignsPage() {
  const qc = useQueryClient();
  const fetchCampaigns = useServerFn(listCampaigns);
  const fetchMembers = useServerFn(listMembers);
  const fetchTithes = useServerFn(listTithes);
  const fetchTithesReport = useServerFn(getTithesReport);
  const saveCampaign = useServerFn(upsertCampaign);
  const removeCampaign = useServerFn(deleteCampaign);
  const saveTithe = useServerFn(upsertTithe);
  const removeTithe = useServerFn(deleteTithe);

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => fetchCampaigns(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers(),
  });

  const { data: tithes = [] } = useQuery({
    queryKey: ["tithes"],
    queryFn: () => fetchTithes(),
  });

  const { data: tithesReport = null } = useQuery({
    queryKey: ["tithes-report"],
    queryFn: () => fetchTithesReport({ data: {} }),
  });

  const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
  const [openTitheDialog, setOpenTitheDialog] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    id: "",
    name: "",
    description: "",
    goal_amount_cents: 0,
    start_date: "",
    end_date: "",
    is_active: true,
    pix_key: "",
    sort_order: 0,
  });
  const [titheForm, setTitheForm] = useState({
    id: "",
    member_id: "",
    amount_cents: 0,
    contributed_at: new Date().toISOString().split("T")[0],
    status: "recorded",
    notes: "",
  });

  const campaignsMut = useMutation({
    mutationFn: (form: typeof campaignForm) => saveCampaign({ data: form as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campanha salva");
      setOpenCampaignDialog(false);
      setCampaignForm({
        id: "",
        name: "",
        description: "",
        goal_amount_cents: 0,
        start_date: "",
        end_date: "",
        is_active: true,
        pix_key: "",
        sort_order: 0,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteCampaignMut = useMutation({
    mutationFn: (id: string) => removeCampaign({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campanha removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const thithesMut = useMutation({
    mutationFn: (form: typeof titheForm) => saveTithe({ data: form as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tithes", "tithes-report"] });
      toast.success("Dízimo registrado");
      setOpenTitheDialog(false);
      setTitheForm({
        id: "",
        member_id: "",
        amount_cents: 0,
        contributed_at: new Date().toISOString().split("T")[0],
        status: "recorded",
        notes: "",
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTitheMut = useMutation({
    mutationFn: (id: string) => removeTithe({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tithes", "tithes-report"] });
      toast.success("Dízimo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editCampaign = (campaign: Campaign) => {
    setCampaignForm({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || "",
      goal_amount_cents: campaign.goal_amount_cents,
      start_date: campaign.start_date || "",
      end_date: campaign.end_date || "",
      is_active: campaign.is_active,
      pix_key: campaign.pix_key || "",
      sort_order: campaign.sort_order,
    });
    setOpenCampaignDialog(true);
  };

  const totalDonated = tithesReport?.totalAmount || 0;
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal_amount_cents, 0);
  const percentReached = totalGoal > 0 ? Math.round((totalDonated / totalGoal) * 100) : 0;

  if (loadingCampaigns)
    return (
      <AppShell>
        <div className="p-6">Carregando...</div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">💰 Campanhas e Dízimos</h1>
            <p className="text-gray-600">Gerencie campanhas de arrecadação e registro de dízimos</p>
          </div>
          <Dialog open={openCampaignDialog} onOpenChange={setOpenCampaignDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setCampaignForm({
                    id: "",
                    name: "",
                    description: "",
                    goal_amount_cents: 0,
                    start_date: "",
                    end_date: "",
                    is_active: true,
                    pix_key: "",
                    sort_order: 0,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{campaignForm.id ? "Editar" : "Nova"} Campanha</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    placeholder="Reforma do telhado"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={campaignForm.description}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, description: e.target.value })
                    }
                    placeholder="Descrição da campanha"
                  />
                </div>
                <div>
                  <Label>Meta de Arrecadação (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={campaignForm.goal_amount_cents / 100}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        goal_amount_cents: Math.round(parseFloat(e.target.value) * 100),
                      })
                    }
                    placeholder="10000.00"
                  />
                </div>
                <div>
                  <Label>Chave PIX</Label>
                  <Input
                    value={campaignForm.pix_key}
                    onChange={(e) => setCampaignForm({ ...campaignForm, pix_key: e.target.value })}
                    placeholder="chave@banco.com.br"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => campaignsMut.mutate(campaignForm)}
                  disabled={campaignsMut.isPending || !campaignForm.name || campaignForm.goal_amount_cents <= 0}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Arrecadado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDonated)}</div>
              <p className="text-xs text-gray-600 mt-1">{tithesReport?.count || 0} transações</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Meta Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalGoal)}</div>
              <p className="text-xs text-gray-600 mt-1">{campaigns.length} campanhas ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">% Atingido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{percentReached}%</div>
              <Progress value={percentReached} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Média por Doação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(tithesReport?.averageAmount || 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">por registro</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">
              <Target className="mr-2 h-4 w-4" /> Campanhas
            </TabsTrigger>
            <TabsTrigger value="tithes">
              <Wallet className="mr-2 h-4 w-4" /> Dízimos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-600">
                  Nenhuma campanha criada. Clique em "Nova Campanha" para começar.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((campaign) => {
                  const percent = campaign.goal_amount_cents > 0
                    ? Math.round((campaign.current_amount_cents / campaign.goal_amount_cents) * 100)
                    : 0;
                  return (
                    <Card key={campaign.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{campaign.name}</CardTitle>
                            <CardDescription>{campaign.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editCampaign(campaign)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCampaignMut.mutate(campaign.id)}
                              disabled={deleteCampaignMut.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progresso</span>
                            <span className="font-semibold">{percent}%</span>
                          </div>
                          <Progress value={percent} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Arrecadado</p>
                            <p className="font-bold">
                              {formatCurrency(campaign.current_amount_cents)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Meta</p>
                            <p className="font-bold">
                              {formatCurrency(campaign.goal_amount_cents)}
                            </p>
                          </div>
                        </div>
                        {campaign.pix_key && (
                          <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">
                            PIX: {campaign.pix_key}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tithes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Registro de Dízimos</CardTitle>
                <Dialog open={openTitheDialog} onOpenChange={setOpenTitheDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() =>
                        setTitheForm({
                          id: "",
                          member_id: "",
                          amount_cents: 0,
                          contributed_at: new Date().toISOString().split("T")[0],
                          status: "recorded",
                          notes: "",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Registrar Dízimo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{titheForm.id ? "Editar" : "Novo"} Dízimo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Membro</Label>
                        <select
                          value={titheForm.member_id}
                          onChange={(e) =>
                            setTitheForm({ ...titheForm, member_id: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Selecione um membro</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={titheForm.amount_cents / 100}
                          onChange={(e) =>
                            setTitheForm({
                              ...titheForm,
                              amount_cents: Math.round(parseFloat(e.target.value) * 100),
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={titheForm.contributed_at}
                          onChange={(e) =>
                            setTitheForm({ ...titheForm, contributed_at: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => thithesMut.mutate(titheForm)}
                        disabled={
                          thithesMut.isPending ||
                          !titheForm.member_id ||
                          titheForm.amount_cents <= 0
                        }
                      >
                        Salvar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tithes.length === 0 ? (
                  <p className="text-gray-600 text-center py-6">Nenhum dízimo registrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Membro</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tithes.map((tithe) => (
                          <TableRow key={tithe.id}>
                            <TableCell className="font-medium">
                              {tithe.members?.full_name || "N/A"}
                            </TableCell>
                            <TableCell>{formatCurrency(tithe.amount_cents)}</TableCell>
                            <TableCell>{tithe.contributed_at}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  tithe.status === "recorded"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {tithe.status === "recorded" ? "Registrado" : "Verificado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteTitheMut.mutate(tithe.id)}
                                disabled={deleteTitheMut.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
