import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListProducts,
  adminSaveProduct,
  adminDeleteProduct,
} from "@/lib/admin-products.functions";
import { getIsAdmin } from "@/lib/admin.functions";
import { Package, Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { formatCentsBRL } from "@/lib/billing-plans";
import { supabase } from "@/integrations/supabase/client";

const RECOMMENDED_W = 1200;
const RECOMMENDED_H = 800;

function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  function readDimensions(file: File) {
    return new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ w: img.naturalWidth, h: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Falha ao ler imagem"));
      };
      img.src = url;
    });
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB.");
      return;
    }
    setUploading(true);
    try {
      const dims = await readDimensions(file).catch(() => null);
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const finalUrl = dims
        ? `${pub.publicUrl}?dim=${dims.w}x${dims.h}`
        : pub.publicUrl;
      onChange(finalUrl);
      toast.success(
        dims ? `Imagem enviada (${dims.w}×${dims.h}px)` : "Imagem enviada",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const dimMatch = value.match(/[?&]dim=(\d+)x(\d+)/);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… ou envie um arquivo"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Enviando…" : "Enviar"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Tamanho recomendado: <strong>{RECOMMENDED_W}×{RECOMMENDED_H}px</strong> (proporção 3:2, máx 5MB).
        {dimMatch && (
          <>
            {" "}Atual: <strong>{dimMatch[1]}×{dimMatch[2]}px</strong>.
          </>
        )}
      </p>
      {value && !dimMatch && (
        <p className="text-xs text-muted-foreground">
          Dica: anexe <code>?dim=LARGURAxALTURA</code> ao final do link para registrar o tamanho.
        </p>
      )}
      {value && (
        <img
          src={value}
          alt="Pré-visualização"
          className="mt-2 max-h-32 rounded-md border object-cover"
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProductsPage,
});

type ProductForm = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price_brl: string; // input as "29,00"
  image_url: string;
  features: string; // newline separated
  external_url: string;
  badge: string;
  active: boolean;
  featured: boolean;
  sort_order: number;
};

const empty: ProductForm = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price_brl: "0",
  image_url: "",
  features: "",
  external_url: "",
  badge: "",
  active: true,
  featured: false,
  sort_order: 0,
};

function parsePriceToCents(v: string) {
  const cleaned = v.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function AdminProductsPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const list = useServerFn(adminListProducts);
  const save = useServerFn(adminSaveProduct);
  const del = useServerFn(adminDeleteProduct);
  const qc = useQueryClient();

  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = !!adminCheck?.isAdmin;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => list(),
    enabled: isAdmin,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(empty);

  const saveMut = useMutation({
    mutationFn: (f: ProductForm) =>
      save({
        data: {
          id: f.id,
          slug: f.slug,
          name: f.name,
          tagline: f.tagline,
          description: f.description,
          price_cents: parsePriceToCents(f.price_brl),
          image_url: f.image_url || null,
          features: f.features
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          external_url: f.external_url || null,
          badge: f.badge || null,
          active: f.active,
          featured: f.featured,
          sort_order: Number(f.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Produto salvo");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Produto removido");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p: (typeof products)[number]) {
    setForm({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      price_brl: (p.price_cents / 100).toFixed(2).replace(".", ","),
      image_url: p.image_url ?? "",
      features: Array.isArray(p.features) ? (p.features as string[]).join("\n") : "",
      external_url: p.external_url ?? "",
      badge: p.badge ?? "",
      active: p.active,
      featured: p.featured,
      sort_order: p.sort_order,
    });
    setOpen(true);
  }

  if (checking) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Verificando permissões…</div>
      </AppShell>
    );
  }
  if (!isAdmin) {
    return (
      <AppShell>
        <div className="p-6 max-w-xl">
          <Card className="p-8 text-center">
            <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h1 className="text-xl font-semibold">Área restrita</h1>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" /> Produtos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre plugins e módulos extras que aparecerão no marketplace dos usuários.
            </p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4" /> Novo produto</Button>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Carregando…</TableCell></TableRow>
              )}
              {!isLoading && products.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Nenhum produto cadastrado.</TableCell></TableRow>
              )}
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    {p.tagline && <div className="text-xs text-muted-foreground line-clamp-1">{p.tagline}</div>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCentsBRL(p.price_cents)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={p.active ? "default" : "outline"}>{p.active ? "Ativo" : "Inativo"}</Badge>
                      {p.featured && <Badge variant="secondary">Destaque</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Excluir "${p.name}"?`)) delMut.mutate(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar produto" : "Novo produto"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    placeholder="plugin-liturgia"
                  />
                </div>
              </div>
              <div>
                <Label>Frase curta (tagline)</Label>
                <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </div>
              <div>
                <Label>Descrição completa</Label>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Recursos (um por linha)</Label>
                <Textarea
                  rows={4}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder={"Liturgia do dia\nLeituras automáticas\nCompatível com WordPress"}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Preço (R$)</Label>
                  <Input value={form.price_brl} onChange={(e) => setForm({ ...form, price_brl: e.target.value })} />
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>URL da imagem de capa</Label>
                <ImageUploadField
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                />
              </div>
              <div>
                <Label>Link externo (opcional)</Label>
                <Input value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label>Etiqueta (ex: "Novo")</Label>
                <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Ativo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> Destaque
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>
                {saveMut.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}