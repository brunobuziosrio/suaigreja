import { Link, useRouterState } from "@tanstack/react-router";
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
  { tab: "secoes", title: "Seções visíveis", icon: Eye },
  { tab: "contatos", title: "Contatos & Redes", icon: Share2 },
  { tab: "doacoes", title: "Doações (Pix)", icon: HandCoins },
] as const;

const communityItems = [
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Eventos", url: "/eventos", icon: CalendarHeart },
  { title: "Notícias", url: "/hub", search: { tab: "noticias" }, icon: Newspaper },
  { title: "Transmissões", url: "/transmissoes", icon: Radio },
  { title: "Pedidos de Oração", url: "/oracoes", icon: HandHeart },
] as const;

const pastoralItems = [
  { title: "Membros", url: "/membros", icon: IdCard },
  { title: "EBD / Escola Bíblica", url: "/ebd", icon: GraduationCap },
  { title: "Documentos", url: "/documentos", icon: FileText },
  { title: "Pequenos Grupos / Células", url: "/celulas", icon: Users2 },
  { title: "Check-in de Cultos", url: "/checkin", icon: QrCode },
  { title: "Devocional Diário", url: "/devocional", icon: BookOpen },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
] as const;

const configItems = [
  { title: "Locais", url: "/locations", icon: MapPin },
  { title: "Tipos de evento", url: "/types", icon: ListChecks },
  { title: "Embed & Integrações", url: "/embed", icon: Code2 },
  { title: "Configurações gerais", url: "/settings", icon: Settings },
] as const;

const accountItems = [
  { title: "Plugins & Extras", url: "/marketplace", icon: Store },
  { title: "Assinatura", url: "/billing", icon: WalletCards },
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

  const isInHub = currentPath === "/hub" && currentHubTab !== "noticias";
  const isInCommunity = communityItems.some(
    (i) => currentPath === i.url && (!("search" in i) || currentHubTab === i.search.tab),
  );
  const isInPastoral = pastoralItems.some((i) => currentPath === i.url);
  const isInConfig = configItems.some((i) => currentPath === i.url);
  const isInAccount = accountItems.some((i) => currentPath === i.url);
  const isInAdmin = currentPath.startsWith("/admin");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-2">
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
          {branding.icon_url ? (
            <img
              src={branding.icon_url}
              alt=""
              className="h-8 w-8 shrink-0 rounded-md object-cover shadow-sm"
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
            {branding.logo_url ? (
              <img
                src={branding.logo_url}
                alt={branding.brand_text}
                style={{ height: branding.logo_height_px }}
                className="w-auto object-contain"
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Página da Igreja */}
        <SidebarGroup>
          <SidebarGroupLabel>Página da Igreja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={false} className="group/collapse">
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

        {/* Comunidade */}
        <SidebarGroup>
          <SidebarGroupLabel>Comunidade</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInCommunity} className="w-full">
                      <Users className="h-4 w-4" />
                      <span>Comunidade</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {communityItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              currentPath === sub.url &&
                              (!("search" in sub) || currentHubTab === sub.search.tab)
                            }
                          >
                            <Link
                              to={sub.url}
                              search={"search" in sub ? sub.search : undefined}
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

        {/* Pastoral */}
        <SidebarGroup>
          <SidebarGroupLabel>Pastoral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInPastoral} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInPastoral} className="w-full">
                      <BookOpenCheck className="h-4 w-4" />
                      <span>Membros & EBD</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {pastoralItems.map((sub) => (
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

        {/* Conta & Serviços */}
        <SidebarGroup>
          <SidebarGroupLabel>Conta & Serviços</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isInAccount} className="group/collapse">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isInAccount} className="w-full">
                      <Store className="h-4 w-4" />
                      <span>Planos & Extras</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {accountItems.map((sub) => (
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
