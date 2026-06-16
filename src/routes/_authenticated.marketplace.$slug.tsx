import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProductBySlug, createProductPixPayment } from "@/lib/products.functions";
import { formatCentsBRL } from "@/lib/billing-plans";
import { ArrowLeft, Check, Copy, ExternalLink, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/marketplace/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const fetchProduct = useServerFn(getProductBySlug);
  const buy = useServerFn(createProductPixPayment);
  const qc = useQueryClient();

  const [tx, setTx] = useState<Awaited<ReturnType<typeof buy>> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct({ data: { slug } }),
  });

  const mut = useMutation({
    mutationFn: () => buy({ data: { productId: data!.product.id } }),
    onSuccess: (t) => {
      setTx(t);
      toast.success("PIX gerado");
      qc.invalidateQueries({ queryKey: ["product", slug] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="w-full p-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      </AppShell>
    );
  }

  if (!data) return null;
  const { product, purchase } = data;
  const isOwned = purchase?.status === "paid";
  const features = Array.isArray(product.features) ? (product.features as string[]) : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/marketplace"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-6">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/10 via-muted to-accent/10 flex items-center justify-center">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="h-16 w-16 text-muted-foreground/40" />
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
                  {product.featured && <Badge>Destaque</Badge>}
                </div>
                <h1 className="text-2xl font-semibold tracking-tight mt-2">{product.name}</h1>
                {product.tagline && <p className="text-muted-foreground mt-1">{product.tagline}</p>}
              </div>
              {product.description && (
                <div className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">
                  {product.description}
                </div>
              )}
              {features.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {f}</li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4 h-fit sticky top-6">
            <div className="text-3xl font-semibold">
              {product.price_cents > 0 ? formatCentsBRL(product.price_cents) : "Grátis"}
            </div>
            {isOwned ? (
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                  <Check className="h-4 w-4" /> Você já possui este produto.
                </div>
                {product.external_url && (
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <a href={product.external_url} target="_blank" rel="noreferrer">
                      Acessar <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Button
                  className="w-full"
                  disabled={mut.isPending || product.price_cents <= 0}
                  onClick={() => mut.mutate()}
                >
                  {mut.isPending ? "Gerando PIX…" : "Comprar com PIX"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Pagamento via AtivoPay. Liberação automática após confirmação.
                </p>
              </>
            )}

            {tx && (
              <div className="space-y-3 pt-2 border-t">
                {tx.qr_code && <img src={tx.qr_code} alt="QR Code PIX" className="w-full max-w-[240px] mx-auto" />}
                <div className="flex gap-2">
                  <Input readOnly value={tx.copy_paste ?? ""} className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (tx.copy_paste) {
                        navigator.clipboard.writeText(tx.copy_paste);
                        toast.success("Código PIX copiado");
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}