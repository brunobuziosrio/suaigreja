export type MarketingTier = {
  id: "embed" | "presenca" | "pro";
  name: string;
  tagline: string;
  priceLabel: string;
  amountCents: number;
  features: string[];
  highlight?: boolean;
};

export const MARKETING_TIERS: MarketingTier[] = [
  {
    id: "embed",
    name: "Embed",
    tagline: "Para igrejas que já têm site",
    priceLabel: "R$ 29/mês",
    amountCents: 2900,
    features: [
      "Agenda de celebrações",
      "Código para colar no site existente",
      "Atualizações em tempo real",
      "Suporte por WhatsApp",
    ],
  },
  {
    id: "presenca",
    name: "Presença",
    tagline: "Tenha sua presença digital completa",
    priceLabel: "R$ 49/mês",
    amountCents: 4900,
    highlight: true,
    features: [
      "Tudo do plano Embed",
      "Hub público suaigreja.top/sua-igreja",
      "Página de eventos com inscrição e Pix",
      "Pedidos de oração",
      "Lista de visitantes (QR Code)",
      "Links sociais e Pix integrados",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Domínio próprio e site personalizado",
    priceLabel: "R$ 99/mês",
    amountCents: 9900,
    features: [
      "Tudo do plano Presença",
      "Domínio próprio (paroquiasaojose.com.br)",
      "Landing page personalizada",
      "Suporte prioritário",
      "Acesso antecipado aos novos módulos",
    ],
  },
];