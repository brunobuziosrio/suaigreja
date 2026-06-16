import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, MapPin, ListChecks, CalendarDays, Code2, Settings, ShieldCheck,
  WalletCards, Store, Package, Users, CalendarHeart, HandHeart, UserPlus, Globe,
  Settings as SettingsIcon, Image as ImageIcon, LayoutTemplate, Sparkle,
  MessageSquareQuote, Newspaper, Share2, HandCoins, Eye, ChevronDown, Radio,
  IdCard, GraduationCap, FileText, BookOpenCheck, Users2, QrCode, BookOpen, BarChart3,
  Megaphone, MessageCircle,
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

const hubSubItems = [
  { tab: "geral", title: "Geral", icon: SettingsIcon },
  { tab: "aparencia", title: "Galeria", icon: ImageIcon },
  { tab: "slides", title: "Slides", icon: LayoutTemplate },
  { tab: "destaques", title: "Destaques", icon: Sparkle },
  { tab: "mensagem", title: "Mensagem da semana", icon: MessageSquareQuote },
  { tab: "noticias", title: "Notícias", icon: Newspaper },
  { tab: "secoes", title: "Seções visíveis", icon: Eye },
  { tab: "contatos", title: "Contatos & Redes", icon: Share2 },
  { tab: "doacoes", title: "Doações (Pix)", icon: HandCoins },
] as const;

const agendaItems = [
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Eventos", url: "/eventos", icon: CalendarHeart },
  { title: "Transmissões", url: "/transmissoes", icon: Radio },
  { title: "Check-in de Cultos", url: "/checkin", icon: QrCode },
] as const;

const peopleItems = [
  { title: "Membros", url: "/membros", icon: IdCard },
  { title: "Visitantes", url: "/visitantes", icon: UserPlus },
  { title: "Pequenos Grupos / Células", url: "/celulas", icon: Users2 },
  { title: "Pedidos de Oração", url: "/oracoes", icon: HandHeart },
] as const;

const teachingItems = [
  { title: "EBD / Escola Bíblica", url: "/ebd", icon: GraduationCap },
  { title: "Devocional Diário", url: "/devocional", icon: BookOpen },
  { title: "Documentos", url: "/documentos", icon: FileText },
] as const;

const storeItems = [
  { title: "Plugins & Extras", url: "/marketplace", icon: Store },
  { title: "Assinatura", url: "/billing", icon: WalletCards },
] as const;

const configItems = [
  { title: "Locais", url: "/locations", icon: MapPin },
  { title: "Tipos de evento", url: "/types", icon: ListChecks },
  { title: "Embed & Integrações", url: "/embed", icon: Code2 },
  { title: "Configurações gerais", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const currentSearch = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const currentHubTab = (currentSearch?.tab as string | undefined) ?? "geral";
  const { user } = useAuth();
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminCheck } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });
  const isAdmin = !!adminCheck?.isAdmin;
  const { data: brandingData } = useBranding();
  const branding = brandingData ?? BRANDING_DEFAULTS;

  const [iconError, setIconError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Reset error states when branding data changes
  useEffect(() => {
    setIconError(false);
    setLogoError(false);
  }, [branding.icon_url, branding.logo_url]);

  const isInHub = currentPath === "/hub";
  const isInAgenda = agendaItems.some((i) => currentPath === i.url);
  const isInPeople = peopleItems.some((i) => currentPath === i.url);
  const isInTeaching = teachingItems.some((i) => currentPath === i.url);
  const isInStore = storeItems.some((i) => currentPath === i.url);
  const isInConfig = configItems.some((i) => currentPath === i.url);
  const isInAdmin = currentPath.startsWith("/admin");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-2">
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#467da5] to-[#2c5879] text-white font-bold text-sm shadow-sm"
            >
              {branding.icon_text}
            </span>
          )}
          <span className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden min-w-0">
            {branding.logo_url && !logoError ? (
              <img
                src={branding.logo_url}
                alt={branding.brand_text}
                style={{ height: branding.logo_height_px }}
                className="w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="font-serif text-base font-semibold tracking-tight text-sidebar-foreground truncate">
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
      <SidebarContent>
        {/* Visão geral */}
        <SidebarGroup>
          <SidebarGroupLabel>Visão geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/dashboard"}>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/relatorios"}>
                  <Link to="/relatorios" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Relatórios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Página da Igreja */}
        <SidebarGroup>
          <SidebarGroupLabel>Página da Igreja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInHub} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInHub} className="w-full">
                      <Globe className="h-4 w-4" />
                      <span>Seções do site</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {hubSubItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.tab}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isInHub && currentHubTab === sub.tab}
                          >
                            <Link
                              to="/hub"
                              search={{ tab: sub.tab === "geral" ? undefined : sub.tab } as any}
                              className="flex items-center gap-2"
                            >
                              <sub.icon className="h-3.5 w-3.5" />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Agenda & Eventos */}
        <SidebarGroup>
          <SidebarGroupLabel>Agenda & Eventos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInAgenda} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInAgenda} className="w-full">
                      <CalendarDays className="h-4 w-4" />
                      <span>Agenda & Eventos</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {agendaItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton asChild isActive={currentPath === sub.url}>
                            <Link to={sub.url} className="flex items-center gap-2">
                              <sub.icon className="h-3.5 w-3.5" />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pessoas */}
        <SidebarGroup>
          <SidebarGroupLabel>Pessoas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInPeople} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInPeople} className="w-full">
                      <Users className="h-4 w-4" />
                      <span>Pessoas</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {peopleItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton asChild isActive={currentPath === sub.url}>
                            <Link to={sub.url} className="flex items-center gap-2">
                              <sub.icon className="h-3.5 w-3.5" />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ensino & Discipulado */}
        <SidebarGroup>
          <SidebarGroupLabel>Ensino & Discipulado</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInTeaching} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInTeaching} className="w-full">
                      <BookOpenCheck className="h-4 w-4" />
                      <span>Ensino & Discipulado</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {teachingItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton asChild isActive={currentPath === sub.url}>
                            <Link to={sub.url} className="flex items-center gap-2">
                              <sub.icon className="h-3.5 w-3.5" />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Comunicação */}
        <SidebarGroup>
          <SidebarGroupLabel>Comunicação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/whatsapp"}>
                  <Link to="/whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Loja & Assinatura */}
        <SidebarGroup>
          <SidebarGroupLabel>Loja & Assinatura</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInStore} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInStore} className="w-full">
                      <Store className="h-4 w-4" />
                      <span>Loja & Assinatura</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {storeItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton asChild isActive={currentPath === sub.url}>
                            <Link to={sub.url} className="flex items-center gap-2">
                              <sub.icon className="h-3.5 w-3.5" />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações da Igreja */}
        <SidebarGroup>
          <SidebarGroupLabel>Configurações da Igreja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInConfig} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInConfig} className="w-full">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {configItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton asChild isActive={currentPath === sub.url}>
                            <Link to={sub.url} className="flex items-center gap-2">
                              <sub.icon className="h-3.5 w-3.5" />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen={isInAdmin} className="group/collapse">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isInAdmin} className="w-full">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={currentPath === "/admin"}>
                            <Link to="/admin" className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5" />
                              <span>Contas</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={currentPath === "/admin/products"}>
                            <Link to="/admin/products" className="flex items-center gap-2">
                              <Package className="h-3.5 w-3.5" />
                              <span>Produtos</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={currentPath === "/admin/feedback"}>
                            <Link to="/admin/feedback" className="flex items-center gap-2">
                              <Megaphone className="h-3.5 w-3.5" />
                              <span>Atualizações & Sugestões</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={currentPath === "/admin/payments"}>
                            <Link to="/admin/payments" className="flex items-center gap-2">
                              <WalletCards className="h-3.5 w-3.5" />
                              <span>Pagamentos da plataforma</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
