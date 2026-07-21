import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const PLATFORM_LEGAL_VERSION = "2026-07-16";
const OAUTH_LEGAL_ACCEPTANCE_KEY = "suaigreja.oauth-legal-acceptance";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      } else {
        if (!legalAccepted) {
          toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { platform_terms_version: PLATFORM_LEGAL_VERSION, platform_privacy_version: PLATFORM_LEGAL_VERSION },
          },
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
    if (mode === "signup" && !legalAccepted) {
      toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        sessionStorage.setItem(
          OAUTH_LEGAL_ACCEPTANCE_KEY,
          JSON.stringify({
            platform_terms_version: PLATFORM_LEGAL_VERSION,
            platform_privacy_version: PLATFORM_LEGAL_VERSION,
          }),
        );
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        sessionStorage.removeItem(OAUTH_LEGAL_ACCEPTANCE_KEY);
        throw error;
      }
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast.success("Enviamos um link de recuperação para seu e-mail.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar recuperação de senha");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Agenda Religiosa</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Entre na sua conta" : "Crie sua conta gratuita"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          {mode === "signup" && (
            <label className="flex cursor-pointer items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(event) => setLegalAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <span>Li e concordo com os <Link to="/termos-de-uso" className="font-medium text-primary underline underline-offset-2">Termos de Uso</Link> e a <Link to="/privacidade-plataforma" className="font-medium text-primary underline underline-offset-2">Política de Privacidade</Link> da plataforma.</span>
            </label>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>

          {mode === "signin" && (
            <button
              type="button"
              className="w-full cursor-pointer text-sm text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleForgotPassword}
              disabled={submitting}
            >
              Esqueci minha senha
            </button>
          )}
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={submitting || (mode === "signup" && !legalAccepted)}
        >
          Continuar com Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? "Ainda não tem conta? " : "Já tem conta? "}
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </Card>
    </div>
  );
}
