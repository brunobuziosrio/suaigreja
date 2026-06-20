import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CalendarHeart,
  ChevronDown,
  CircleDollarSign,
  Code2,
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
  Package,
  QrCode,
  Radio,
  Settings,
  ShieldCheck,
  Store,
  UserPlus,
  Users,
  Users2,
  WalletCards,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { useBranding, BRANDING_DEFAULTS } from "@/hooks/use-branding";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type NavItem = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
};

const primaryItems: NavItem[] = [
  { title: "Visão geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const navGroups: Array<{ label: string; icon: NavItem["icon"]; items: NavItem[] }> = [
  {
    label: "Site e comunicação",
    icon: Globe,
    items: [
      { title: "Página da igreja", url: "/hub", icon: Globe },
      { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
      { title: "Transmissões", url: "/transmissoes", icon: Radio },
    ],
  },
  {
    label: "Pessoas e cuidado",
    icon: Users,
    items: [
      { title: "Membros", url: "/membros", icon: IdCard },
      { title: "Visitantes", url: "/visitantes", icon: UserPlus },
      { title: "Pequenos grupos", url: "/celulas", icon: Users2 },
      { title: "Pedidos de oração", url: "/oracoes", icon: HandHeart },
    ],
  },
  {
    label: "Agenda e operação",
    icon: CalendarDays,
    items: [
      { title: "Agenda", url: "/agenda", icon: CalendarDays },
      { title: "Eventos", url: "/eventos", icon: CalendarHeart },
      { title: "Check-in", url: "/checkin", icon: QrCode },
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
    label: "Gestão",
    icon: Settings,
    items: [
      { title: "Finanças", url: "/finances", icon: CircleDollarSign },
      { title: "Configurações", url: "/settings", icon: Settings },
      { title: "Integrações", url: "/embed", icon: Code2 },
      { title: "Plugins e extras", url: "/marketplace", icon: Store },
      { title: "Assinatura", url: "/billing", icon: WalletCards },
    ],
  },
];

function NavGroup({
  label,
  icon: GroupIcon,
  items,
  currentPath,
}: {
  label: string;
  icon: NavItem["icon"];
  items: NavItem[];
  currentPath: string;
}) {
  const isActive = items.some(
    (item) => currentPath === item.url || currentPath.startsWith(`${item.url}/`),
  );

  return (
    <Collapsible defaultOpen={isActive} className="group/collapse">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            className="h-10 w-full"
            aria-label={`${isActive ? "Recolher" : "Expandir"} ${label}`}
          >
            <GroupIcon className="h-4 w-4" />
            <span>{label}</span>
            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapse:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={currentPath === item.url}
                  className="min-h-9"
                >
                  <Link to={item.url} activeOptions={{ exact: true }}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useAuth();
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminCheck } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });
  const { data: brandingData } = useBranding();
  const branding = brandingData ?? BRANDING_DEFAULTS;
  const [iconError, setIconError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const adminItems: NavItem[] = [
    { title: "Contas", url: "/admin", icon: Users },
    { title: "Produtos", url: "/admin/products", icon: Package },
    { title: "Atualizações", url: "/admin/feedback", icon: Megaphone },
    { title: "Pagamentos", url: "/admin/payments", icon: WalletCards },
  ];

  return (
    <Sidebar collapsible="icon" aria-label="Navegação principal">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-2">
        <Link
          to="/dashboard"
          className="flex min-h-10 min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {branding.icon_url && !iconError ? (
            <img
              src={branding.icon_url}
              alt=""
              className="h-8 w-8 shrink-0 rounded-md object-cover shadow-sm"
              onError={() => setIconError(true)}
            />
          ) : (
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sidebar-primary to-sand text-sm font-bold text-sidebar-primary-foreground shadow-sm"
            >
              {branding.icon_text}
            </span>
          )}
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            {branding.logo_url && !logoError ? (
              <img
                src={branding.logo_url}
                alt={branding.brand_text}
                style={{ height: branding.logo_height_px }}
                className="w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="truncate font-display text-base font-semibold tracking-tight text-sidebar-foreground">
                {branding.brand_text}
              </span>
            )}
            {branding.subtitle && (
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {branding.subtitle}
              </span>
            )}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Início</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url} className="h-10">
                    <Link to={item.url} activeOptions={{ exact: true }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">
          <SidebarGroupLabel>Áreas de trabalho</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGroups.map((group) => (
                <NavGroup key={group.label} {...group} currentPath={currentPath} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!!adminCheck?.isAdmin && (
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavGroup
                  label="Plataforma"
                  icon={ShieldCheck}
                  items={adminItems}
                  currentPath={currentPath}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
