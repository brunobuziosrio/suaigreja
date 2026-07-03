// Definição central de navegação do painel.
// Fonte única consumida pela barra lateral (app-sidebar) e pela busca global
// (global-search), evitando duplicação e mantendo rótulos por tradição religiosa.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import type { ComponentType } from "react";
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CalendarHeart,
  Code2,
  CircleDollarSign,
  FileText,
  Globe,
  GraduationCap,
  HandHeart,
  IdCard,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Megaphone,
  MessageCircle,
  Newspaper,
  Package,
  QrCode,
  Radio,
  Settings,
  ShieldCheck,
  Store,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Users2,
  WalletCards,
  ClipboardList,
} from "lucide-react";
import type { getReligionTerms } from "@/lib/religion-profiles";

export type NavItem = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavGroupDef = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: NavItem[];
};

type ReligionTerms = ReturnType<typeof getReligionTerms>;

export const primaryItems: NavItem[] = [
  { title: "Visão geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

export const adminItems: NavItem[] = [
  { title: "Contas", url: "/admin", icon: Users },
  { title: "Produtos", url: "/admin/products", icon: Package },
  { title: "Atualizações", url: "/admin/feedback", icon: Megaphone },
  { title: "Pagamentos", url: "/admin/payments", icon: WalletCards },
  { title: "WhatsApp", url: "/admin/whatsapp", icon: MessageCircle },
  { title: "Domínios", url: "/admin/domains", icon: Globe },
];

export const adminGroup = {
  label: "Plataforma",
  icon: ShieldCheck,
};

export function getNavGroups(terms: ReligionTerms): NavGroupDef[] {
  return [
    {
      label: "Site e comunicação",
      icon: Globe,
      items: [
        { title: terms.publicPage, url: "/hub", icon: Globe },
        { title: "Boletim Semanal", url: "/boletim", icon: Newspaper },
        { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
        { title: "Transmissões", url: "/transmissoes", icon: Radio },
      ],
    },
    {
      label: "Comunidade",
      icon: Users,
      items: [
        { title: terms.people, url: "/membros", icon: IdCard },
        { title: "Visitantes", url: "/visitantes", icon: UserPlus },
        { title: terms.smallGroups, url: "/celulas", icon: Users2 },
        { title: "Pedidos de oração", url: "/oracoes", icon: HandHeart },
        { title: terms.secretaryPortal, url: "/secretaria", icon: ClipboardList },
      ],
    },
    {
      label: "Agenda e operação",
      icon: CalendarDays,
      items: [
        { title: "Agenda", url: "/agenda", icon: CalendarDays },
        { title: "Eventos", url: "/eventos", icon: CalendarHeart },
        { title: "Check-in", url: "/checkin", icon: QrCode },
        { title: "Escalas de Voluntários", url: "/escalas", icon: UserCheck },
        { title: "Locais", url: "/locations", icon: MapPin },
        { title: "Tipos de evento", url: "/types", icon: ListChecks },
      ],
    },
    {
      label: "Ensino e conteúdo",
      icon: BookOpenCheck,
      items: [
        { title: "Escola bíblica", url: "/ebd", icon: GraduationCap },
        { title: "Devocionais", url: "/devocional", icon: BookOpen },
        { title: "Documentos", url: "/documentos", icon: FileText },
      ],
    },
    {
      label: "Financeiro",
      icon: CircleDollarSign,
      items: [
        { title: "Finanças", url: "/finances", icon: CircleDollarSign },
        { title: terms.contributionCampaigns, url: "/campanhas", icon: TrendingUp },
      ],
    },
    {
      label: "Sistema e conta",
      icon: Settings,
      items: [
        { title: "Configurações", url: "/settings", icon: Settings },
        { title: "Equipe e permissões", url: "/equipe", icon: ShieldCheck },
        { title: "Integrações", url: "/embed", icon: Code2 },
        { title: "Plugins e extras", url: "/marketplace", icon: Store },
        { title: "Assinatura", url: "/billing", icon: WalletCards },
      ],
    },
  ];
}
