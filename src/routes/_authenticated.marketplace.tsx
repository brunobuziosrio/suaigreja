import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProducts } from "@/lib/products.functions";
import { formatCentsBRL } from "@/lib/billing-plans";
import { Store, Package, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/marketplace")({
  component: MarketplacePage,
});

function MarketplacePage() {
  const fetchProducts = useServerFn(listProducts);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: () => fetchProducts(),
  });

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6" /> Plugins & Extras
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Amplie seu sistema com módulos extras — liturgia, cadastro de membros, dízimos e mais.
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

        {!isLoading && products.length === 0 && (
          <Card className="p-10 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-semibold">Em breve, novos produtos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Estamos preparando novos módulos. Volte em breve!
            </p>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col group hover:border-primary transition-colors">
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-muted to-accent/10 relative overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                {p.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="gap-1"><Sparkles className="h-3 w-3" /> Destaque</Badge>
                  </div>
                )}
                {p.badge && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{p.badge}</Badge>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold leading-tight">{p.name}</h3>
                {p.tagline && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.tagline}</p>}
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="text-2xl font-semibold">
                    {p.price_cents > 0 ? formatCentsBRL(p.price_cents) : <span className="text-base text-muted-foreground">Grátis</span>}
                  </div>
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link to="/marketplace/$slug" params={{ slug: p.slug }}>
                    Ver detalhes <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}