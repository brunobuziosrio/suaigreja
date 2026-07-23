// Busca global e paleta de ações rápidas do painel.
// Abre com Ctrl+/ ou Ctrl+K (Cmd+K no Mac) e também por um botão na barra
// superior. Lista módulos navegáveis respeitando o plano da conta e oferece
// atalhos para as tarefas mais comuns.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarHeart,
  HandCoins,
  MessageCircle,
  Search,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { getMyAccount } from "@/lib/account.functions";
import { getIsAdmin } from "@/lib/admin.functions";
import { getReligionTerms } from "@/lib/religion-profiles";
import { getMyNavigationAccess, isNavigationPathVisible } from "@/lib/plan-access";
import { adminItems, getNavGroups, primaryItems, type NavItem } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";

type QuickAction = NavItem & { description: string };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const fetchAccount = useServerFn(getMyAccount);
  const fetchNavigationAccess = useServerFn(getMyNavigationAccess);
  const checkAdmin = useServerFn(getIsAdmin);

  const { data: account } = useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => fetchAccount(),
    enabled: !!user,
    staleTime: 60_000,
  });
  const { data: adminCheck } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });
  const { data: navigationAccess } = useQuery({
    queryKey: ["navigation-access", user?.id],
    queryFn: () => fetchNavigationAccess(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const terms = getReligionTerms(account?.religion_profile);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.key === "k" || event.key === "/") && (event.metaKey || event.ctrlKey);
      if (isShortcut) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const navItems = useMemo<NavItem[]>(() => {
    const groups = getNavGroups(terms);
    const flat = [...primaryItems, ...groups.flatMap((group) => group.items)];
    return flat.filter((item) => isNavigationPathVisible(account, item.url, navigationAccess?.visibleModulePaths));
  }, [account, navigationAccess, terms]);

  const quickActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      { title: `Cadastrar ${terms.person}`, url: "/membros", icon: UserPlus, description: "Abrir a ficha de cadastro" },
      { title: "Criar evento", url: "/eventos", icon: CalendarHeart, description: "Publicar um novo evento na agenda" },
      { title: "Nova campanha Pix", url: "/campanhas", icon: HandCoins, description: "Iniciar arrecadação por campanha" },
      { title: "Nova solicitação", url: "/secretaria", icon: ClipboardList, description: "Registrar pedido na secretaria" },
      { title: "Enviar WhatsApp", url: "/whatsapp", icon: MessageCircle, description: "Abrir mensagens e comunicados" },
    ];
    return actions.filter((action) => isNavigationPathVisible(account, action.url, navigationAccess?.visibleModulePaths));
  }, [account, navigationAccess, terms]);

  const adminNav = useMemo<NavItem[]>(() => {
    if (!adminCheck?.isAdmin) return [];
    return adminItems;
  }, [adminCheck]);

  function go(url: string) {
    setOpen(false);
    navigate({ to: url as string });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca e ações rápidas"
        aria-keyshortcuts="Control+K"
        className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-56 lg:min-w-72"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden truncate sm:inline">Buscar módulos e ações</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          Ctrl /
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">Busca e ações rápidas</DialogTitle>
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5">
            <CommandInput placeholder="Buscar módulo ou ação..." />
            <CommandList>
              <CommandEmpty>Nada encontrado. Tente outro termo.</CommandEmpty>

              {quickActions.length > 0 && (
                <CommandGroup heading="Ações rápidas">
                  {quickActions.map((action) => (
                    <CommandItem
                      key={`acao-${action.url}`}
                      value={`acao ${action.title} ${action.description}`}
                      onSelect={() => go(action.url)}
                    >
                      <action.icon className="text-primary" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{action.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />

              <CommandGroup heading="Ir para">
                {navItems.map((item) => (
                  <CommandItem
                    key={`nav-${item.url}`}
                    value={`ir ${item.title} ${item.url}`}
                    onSelect={() => go(item.url)}
                  >
                    <item.icon className="text-muted-foreground" />
                    <span className="truncate">{item.title}</span>
                    <CommandShortcut>{item.url}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>

              {adminNav.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Administração">
                    {adminNav.map((item) => (
                      <CommandItem
                        key={`admin-${item.url}`}
                        value={`admin ${item.title} ${item.url}`}
                        onSelect={() => go(item.url)}
                      >
                        <item.icon className="text-muted-foreground" />
                        <span className="truncate">{item.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
