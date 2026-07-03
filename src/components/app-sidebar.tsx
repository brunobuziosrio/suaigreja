import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin } from "@/lib/admin.functions";
import { getMyAccount } from "@/lib/account.functions";
import { canAccessAccountPath } from "@/lib/plan-access";
import { getReligionTerms } from "@/lib/religion-profiles";
import { adminGroup, adminItems, getNavGroups, primaryItems, type NavItem } from "@/lib/navigation";
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
  const fetchAccount = useServerFn(getMyAccount);
  const { data: adminCheck } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });
  const { data: account } = useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => fetchAccount(),
    enabled: !!user,
    staleTime: 60_000,
  });
  const { data: brandingData } = useBranding();
  const branding = brandingData ?? BRANDING_DEFAULTS;
  const terms = getReligionTerms(account?.religion_profile);
  const navGroups = getNavGroups(terms);
  const [iconError, setIconError] = useState(false);
  const [logoError, setLogoError] = useState(false);

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
              {navGroups.map((group) => {
                const items = group.items.filter((item) => canAccessAccountPath(account, item.url));
                if (items.length === 0) return null;
                return (
                  <NavGroup
                    key={group.label}
                    {...group}
                    items={items}
                    currentPath={currentPath}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!!adminCheck?.isAdmin && (
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavGroup
                  label={adminGroup.label}
                  icon={adminGroup.icon}
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
