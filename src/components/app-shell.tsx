import { type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const sectionName = getSectionName(pathname);

  return (
    <SidebarProvider>
      <a
        href="#conteudo-principal"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
      >
        Ir para o conteúdo
      </a>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-outline bg-background/95 px-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger aria-label="Abrir ou fechar menu" className="h-10 w-10" />
            <Separator orientation="vertical" className="h-4 mx-1" />
            <div className="min-w-0">
              <p className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:block">
                Agenda Religiosa
              </p>
              <p className="truncate font-display text-sm font-semibold tracking-tight text-ink sm:text-base">
                {sectionName}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Sair da conta"
              onClick={async () => {
                await signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>
        <main
          id="conteudo-principal"
          tabIndex={-1}
          className="min-h-[calc(100dvh-4rem)] w-full min-w-0 bg-surface px-4 py-5 outline-none sm:px-6 sm:py-7 lg:px-8"
        >
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

const sectionLabels: Record<string, string> = {
  dashboard: "Visão geral",
  relatorios: "Relatórios",
  hub: "Página da igreja",
  whatsapp: "WhatsApp",
  transmissoes: "Transmissões",
  membros: "Membros",
  visitantes: "Visitantes",
  celulas: "Pequenos grupos",
  oracoes: "Pedidos de oração",
  agenda: "Agenda",
  eventos: "Eventos",
  checkin: "Check-in",
  locations: "Locais",
  types: "Tipos de evento",
  ebd: "Escola bíblica",
  devocional: "Devocionais",
  documentos: "Documentos",
  finances: "Finanças",
  settings: "Configurações",
  embed: "Integrações",
  marketplace: "Plugins e extras",
  billing: "Assinatura",
  admin: "Administração",
};

function getSectionName(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return sectionLabels[segment] ?? "Painel";
}
