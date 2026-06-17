import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, useRouterState, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { u as useAuth } from "./router-BudgN2VI.js";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { g as getMyAccount } from "./account.functions-akZ1oNbv.js";
import { Loader2 } from "lucide-react";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "sonner";
import "./admin-payment-settings.functions-Buvk9CeQ.js";
import "./server-Bu1wP-pG.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-_63E0ssP.js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
function AuthenticatedLayout() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const fetchAccount = useServerFn(getMyAccount);
  const {
    data: account,
    isLoading: accountLoading,
    isError: accountError
  } = useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => fetchAccount(),
    enabled: !!user,
    retry: 1,
    staleTime: 6e4
  });
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({
        to: "/login"
      });
      return;
    }
    if (accountLoading) return;
    if (account === null && pathname !== "/onboarding") {
      navigate({
        to: "/onboarding"
      });
      return;
    }
    if (account && !account.onboarded && pathname !== "/onboarding") {
      navigate({
        to: "/onboarding"
      });
    }
    if (account?.onboarded && pathname === "/onboarding") {
      navigate({
        to: "/dashboard"
      });
    }
  }, [user, loading, account, accountLoading, pathname, navigate]);
  if (loading || !user || accountLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (accountError) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-3 bg-background", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Erro ao carregar os dados da conta." }),
      /* @__PURE__ */ jsx("button", { onClick: () => window.location.reload(), className: "text-sm underline text-primary hover:opacity-80 transition-opacity", children: "Tentar novamente" })
    ] });
  }
  if (!account) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsx(Outlet, {});
}
export {
  AuthenticatedLayout as component
};
