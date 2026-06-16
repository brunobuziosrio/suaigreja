import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicDonationReceipt } from "@/lib/donations.functions";
import { Button } from "@/components/ui/button";
import { HandCoins, Printer } from "lucide-react";

export const Route = createFileRoute("/recibo/$donationId")({
  loader: async ({ params }) => {
    const data = await getPublicDonationReceipt({ data: { id: params.donationId } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Comprovante de doação — ${loaderData?.church?.brand_title ?? "Igreja"}` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReceiptPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <HandCoins className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-semibold mt-3">Comprovante não encontrado</h1>
        <p className="text-sm text-muted-foreground mt-1">
          O link pode estar incorreto ou o pagamento ainda não foi confirmado.
        </p>
      </div>
    </div>
  ),
});

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ReceiptPage() {
  const { donation, church, campaignTitle } = Route.useLoaderData();
  const primary = church?.primary_color || "#0c2340";
  const paidAt = donation.paid_at ? new Date(donation.paid_at) : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:bg-white"
      style={{ background: `linear-gradient(135deg, ${primary}18, ${primary}04)` }}
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 16mm; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
        }
      `}</style>
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm print:shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <HandCoins className="h-6 w-6" style={{ color: primary }} />
          <h1 className="font-semibold">{church?.brand_title ?? "Igreja"}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Comprovante de doação</p>

        <dl className="space-y-2 text-sm">
          {donation.donor_name && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Doador</dt>
              <dd className="font-medium text-right">{donation.donor_name}</dd>
            </div>
          )}
          {campaignTitle && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Campanha</dt>
              <dd className="font-medium text-right">{campaignTitle}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Valor</dt>
            <dd className="font-medium text-right">{fmtBRL(donation.amount_cents)}</dd>
          </div>
          {paidAt && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Data</dt>
              <dd className="font-medium text-right">{paidAt.toLocaleString("pt-BR")}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-right text-green-600">Pago</dd>
          </div>
          {donation.mercadopago_payment_id && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">ID da transação</dt>
              <dd className="font-mono text-xs text-right">{donation.mercadopago_payment_id}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex justify-center print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir / salvar como PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
