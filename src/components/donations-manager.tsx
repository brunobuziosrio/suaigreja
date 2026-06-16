import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  listMyDonationCampaigns,
  upsertDonationCampaign,
  deleteDonationCampaign,
  getDonationCampaignStats,
} from "@/lib/donations.functions";
import { getMyAccount, updateAccountSettings, uploadAccountAsset } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HandCoins, Plus, Trash2, Pencil, Star, ExternalLink, Loader2, Image as ImageIcon } from "lucide-react";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

type Campaign = {
  id?: string;
  title: string;
  description: string;
  image_url: string | null;
  pix_key: string;
  pix_key_type: "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";
  recipient_name: string;
  recipient_city: string;
  suggested_amounts_cents: number[];
  goal_cents: number | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
};

const EMPTY: Campaign = {
  title: "",
  description: "",
  image_url: null,
  pix_key: "",
  pix_key_type: "aleatoria",
  recipient_name: "",
  recipient_city: "BRASIL",
  suggested_amounts_cents: [1000, 2500, 5000, 10000],
  goal_cents: null,
  active: true,
  featured: false,
  sort_order: 0,
};

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DonationsManager({ slug }: { slug?: string | null }) {
  const qc = useQueryClient();
  const list = useServerFn(listMyDonationCampaigns);
  const save = useServerFn(upsertDonationCampaign);
  const remove = useServerFn(deleteDonationCampaign);
  const fetchStats = useServerFn(getDonationCampaignStats);
  const { data: items = [], isLoading } = useQuery({ queryKey: ["my-donations"], queryFn: () => list() });
  const { data: stats = [] } = useQuery({ queryKey: ["donation-campaign-stats"], queryFn: () => fetchStats() });
  const statsByCampaign = new Map(stats.map((s: any) => [s.campaignId, s]));
  const [editing, setEditing] = useState<Campaign | null>(null);

  const saveMut = useMutation({
    mutationFn: (c: Campaign) => save({ data: c as any }),
    onSuccess: () => {
      toast.success("Campanha salva");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["my-donations"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Campanha removida");
      qc.invalidateQueries({ queryKey: ["my-donations"] });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HandCoins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-medium">Campanhas de doação (Pix)</h2>
              <p className="text-xs text-muted-foreground">
                O valor cai direto na conta da igreja. Geramos QR Code Pix válido no padrão Banco Central.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/d/${slug}`} target="_blank" rel="noopener">
                  <ExternalLink className="h-4 w-4 mr-1" />Ver página /d/{slug}
                </a>
              </Button>
            )}
            <Button size="sm" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-4 w-4 mr-1" />Nova campanha
            </Button>
          </div>
        </div>
      </Card>

      <PixKeyCard />

      <FixedImageCard />

      {isLoading ? (
        <div className="text-sm text-muted-foreground p-4"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Carregando…</div>
      ) : items.length === 0 && !editing ? (
        <Card className="p-8 text-center">
          <HandCoins className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma campanha. Crie a primeira pra começar a receber doações.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((c: any) => (
            <Card key={c.id} className="p-4 flex gap-3">
              {c.image_url && <img src={c.image_url} alt="" className="h-16 w-16 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {c.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  <p className="font-medium truncate">{c.title}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {c.pix_key_type} · {c.recipient_name}
                </p>
                {(() => {
                  const s = statsByCampaign.get(c.id);
                  const raised = s?.raisedCents ?? 0;
                  if (!c.goal_cents && raised === 0) return null;
                  const pct = c.goal_cents ? Math.min(100, Math.round((raised / c.goal_cents) * 100)) : null;
                  return (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs">
                        Arrecadado: <strong>{fmtBRL(raised)}</strong>
                        {c.goal_cents ? <> de {fmtBRL(c.goal_cents)} ({pct}%)</> : null}
                      </p>
                      {pct !== null && (
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remover campanha?")) delMut.mutate(c.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <CampaignForm initial={editing} onCancel={() => setEditing(null)} onSave={(c) => saveMut.mutate(c)} saving={saveMut.isPending} />}
    </div>
  );
}

function CampaignForm({
  initial, onCancel, onSave, saving,
}: {
  initial: Campaign;
  onCancel: () => void;
  onSave: (c: Campaign) => void;
  saving: boolean;
}) {
  const [f, setF] = useState<Campaign>(initial);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const set = <K extends keyof Campaign>(k: K, v: Campaign[K]) => setF((p) => ({ ...p, [k]: v }));
  const setAmount = (i: number, brl: string) => {
    const cents = Math.round(parseFloat(brl.replace(",", ".") || "0") * 100);
    setF((p) => {
      const arr = [...p.suggested_amounts_cents];
      arr[i] = cents;
      return { ...p, suggested_amounts_cents: arr.filter((n) => n > 0) };
    });
  };

  function submit() {
    if (!f.title.trim()) return toast.error("Informe o título");
    if (!f.pix_key.trim()) return toast.error("Informe a chave Pix");
    if (!f.recipient_name.trim()) return toast.error("Informe o nome do recebedor");
    onSave({
      ...f,
      image_url: f.image_url?.trim() && /^https?:\/\//i.test(f.image_url.trim()) ? f.image_url.trim() : null,
      suggested_amounts_cents: f.suggested_amounts_cents.filter((n) => n > 0),
    });
  }

  async function uploadCampaignImage(file: File) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file.name)) return toast.error("Use PNG, JPG ou WEBP.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem maior que 5 MB.");
    setUploadingImg(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `donation-campaigns/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      set("image_url", pub.publicUrl);
      toast.success("Imagem enviada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingImg(false);
    }
  }

  return (
    <Card className="p-5 space-y-4 border-primary/40">
      <h3 className="font-medium">{f.id ? "Editar campanha" : "Nova campanha"}</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Título *</Label>
          <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Campanha de Natal" />
        </div>
        <div>
          <Label>Imagem da campanha</Label>
          <div className="flex gap-2">
            <Input
              value={f.image_url ?? ""}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="https://… ou envie um arquivo"
              className="flex-1"
            />
            <input
              ref={imgInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCampaignImage(file);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="outline" onClick={() => imgInputRef.current?.click()} disabled={uploadingImg}>
              {uploadingImg ? "Enviando…" : "Enviar"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Recomendado: <strong>1200×750&nbsp;px</strong> (proporção 16:10). Máx. 5&nbsp;MB.
            Evite textos colados nas bordas — a miniatura é recortada e a imagem cheia abre ao clicar.
          </p>
          {f.image_url && (
            <div className="mt-2 rounded-md border bg-muted/40 p-2 inline-block">
              <img src={f.image_url} alt="Prévia" className="max-h-28 w-auto rounded object-contain" />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Por que esta campanha existe e o que será feito com o valor." />
      </div>

      <Separator />
      <p className="text-sm font-medium">Dados Pix (vão para o QR Code)</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Tipo</Label>
          <Select value={f.pix_key_type} onValueChange={(v) => set("pix_key_type", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aleatoria">Aleatória</SelectItem>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="telefone">Telefone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Chave Pix *</Label>
          <Input value={f.pix_key} onChange={(e) => set("pix_key", e.target.value)} placeholder="chave Pix da igreja" />
        </div>
        <div>
          <Label>Nome do recebedor *</Label>
          <Input value={f.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} maxLength={25} placeholder="IGREJA EXEMPLO" />
          <p className="text-[10px] text-muted-foreground mt-0.5">Máx 25 caracteres (padrão Pix).</p>
        </div>
        <div>
          <Label>Cidade</Label>
          <Input value={f.recipient_city} onChange={(e) => set("recipient_city", e.target.value.toUpperCase())} maxLength={15} />
        </div>
        <div>
          <Label>Meta (R$) — opcional</Label>
          <Input
            type="number" min={0} step="0.01"
            value={f.goal_cents ? (f.goal_cents / 100).toString() : ""}
            onChange={(e) => set("goal_cents", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
            placeholder="5000,00"
          />
        </div>
      </div>

      <Separator />
      <div>
        <Label>Valores sugeridos (R$)</Label>
        <div className="grid grid-cols-4 gap-2 mt-1">
          {[0, 1, 2, 3].map((i) => (
            <Input
              key={i}
              type="number" min={0} step="1"
              defaultValue={f.suggested_amounts_cents[i] ? (f.suggested_amounts_cents[i] / 100).toString() : ""}
              onChange={(e) => setAmount(i, e.target.value)}
              placeholder={["10", "25", "50", "100"][i]}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">O doador também pode digitar um valor livre.</p>
      </div>

      <Separator />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={f.active} onCheckedChange={(v) => set("active", v)} /> Ativa
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={f.featured} onCheckedChange={(v) => set("featured", v)} /> Destacar no topo
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={submit} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Salvar campanha
        </Button>
      </div>
    </Card>
  );
}

function PixKeyCard() {
  const qc = useQueryClient();
  const getAccount = useServerFn(getMyAccount);
  const saveSettings = useServerFn(updateAccountSettings);
  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => getAccount() });
  const [pixKey, setPixKey] = useState("");

  useEffect(() => {
    setPixKey((account as any)?.pix_key ?? "");
  }, [account]);

  const saveMut = useMutation({
    mutationFn: () =>
      saveSettings({
        data: {
          brand_title: (account as any)?.brand_title ?? "Igreja",
          brand_empty_message: (account as any)?.brand_empty_message ?? "Sem celebrações.",
          primary_color: (account as any)?.primary_color ?? "#467da5",
          pix_key: pixKey.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success("Chave Pix salva");
      qc.invalidateQueries({ queryKey: ["my-account"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
          <HandCoins className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium">Chave Pix principal</h3>
          <p className="text-xs text-muted-foreground">
            Usada nas contribuições gerais da página pública. Cada campanha também pode ter sua própria chave.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label>Chave para recebimento</Label>
          <Input
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="CNPJ, CPF, telefone, e-mail ou chave aleatória"
            maxLength={200}
          />
        </div>
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !account}>
          {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Salvar chave Pix
        </Button>
      </div>
    </Card>
  );
}

function FixedImageCard() {
  const qc = useQueryClient();
  const getAccount = useServerFn(getMyAccount);
  const saveSettings = useServerFn(updateAccountSettings);
  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => getAccount() });
  const [url, setUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUrl((account as any)?.donations_fixed_image_url ?? "");
  }, [account]);

  const saveMut = useMutation({
    mutationFn: (newUrl: string | null) =>
      saveSettings({
        data: {
          brand_title: (account as any)?.brand_title ?? "Igreja",
          brand_empty_message: (account as any)?.brand_empty_message ?? "Sem celebrações.",
          primary_color: (account as any)?.primary_color ?? "#467da5",
          donations_fixed_image_url: newUrl,
        } as any,
      }),
    onSuccess: () => {
      toast.success("Imagem fixa salva");
      qc.invalidateQueries({ queryKey: ["my-account"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });

  async function uploadFile(file: File) {
    if (!/\.(png|jpg|jpeg|webp|ico)$/i.test(file.name)) {
      toast.error("Use PNG, JPG, WEBP ou ICO.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await uploadAccountAsset({
        data: {
          folder: "donations-image",
          filename: file.name,
          contentType: file.type,
          base64,
        },
      });
      setUrl(res.url);
      saveMut.mutate(res.url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Imagem fixa de "Faça parte"</h3>
          <p className="text-xs text-muted-foreground">
            Aparece como <strong>primeiro card fixo</strong> do carrossel de "Faça parte" na home pública,
            antes das campanhas. As demais campanhas deslizam ao lado usando as setas do carrossel.
            Recomendado: <strong>800×500&nbsp;px</strong> (proporção 16:10). Máx. 5&nbsp;MB.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… ou envie um arquivo"
          className="flex-1 min-w-[220px]"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Enviando…" : "Enviar arquivo"}
        </Button>
        <Button
          type="button"
          onClick={() => saveMut.mutate(url || null)}
          disabled={saveMut.isPending || uploading}
        >
          {saveMut.isPending ? "Salvando…" : "Salvar"}
        </Button>
        {url && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setUrl(""); saveMut.mutate(null); }}
            disabled={saveMut.isPending}
          >
            Remover
          </Button>
        )}
      </div>

      {url && (
        <div className="rounded-md border bg-muted/40 p-3 inline-block">
          <img src={url} alt="Imagem fixa" className="max-h-44 w-auto object-contain rounded" />
        </div>
      )}
    </Card>
  );
}
