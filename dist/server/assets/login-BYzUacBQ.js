import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-DVtn2Z4s.js";
import { u as useAuth } from "./router-DXfKo2Q8.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "./admin-payment-settings.functions-DESQQOGp.js";
import "./server-D1UATaaE.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DAGjxCX9.js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function LoginPage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [user, loading, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      } else {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setSubmitting(false);
    }
  };
  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar com Google");
      setSubmitting(false);
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Digite seu e-mail para receber o link de recuperação");
      return;
    }
    setSubmitting(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });
      if (error) throw error;
      toast.success("Enviamos um link de recuperação para seu e-mail.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar recuperação de senha");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 px-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Agenda Religiosa" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: mode === "signin" ? "Entre na sua conta" : "Crie sua conta gratuita" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoComplete: "email" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Senha" }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, autoComplete: mode === "signin" ? "current-password" : "new-password" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "submit", className: "w-full", disabled: submitting, children: [
        submitting && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
        mode === "signin" ? "Entrar" : "Criar conta"
      ] }),
      mode === "signin" && /* @__PURE__ */ jsx("button", { type: "button", className: "w-full cursor-pointer text-sm text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60", onClick: handleForgotPassword, disabled: submitting, children: "Esqueci minha senha" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative my-6", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t" }) }),
      /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-card px-2 text-muted-foreground", children: "ou" }) })
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: handleGoogle, disabled: submitting, children: "Continuar com Google" }),
    /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-muted-foreground mt-6", children: [
      mode === "signin" ? "Ainda não tem conta? " : "Já tem conta? ",
      /* @__PURE__ */ jsx("button", { type: "button", className: "text-primary underline-offset-4 hover:underline", onClick: () => setMode(mode === "signin" ? "signup" : "signin"), children: mode === "signin" ? "Criar conta" : "Entrar" })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
