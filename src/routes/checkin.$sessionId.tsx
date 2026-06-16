import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getPublicCheckinSession, publicCheckin } from "@/lib/checkin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkin/$sessionId")({
  component: PublicCheckin,
  head: () => ({ meta: [{ title: "Check-in" }] }),
});

function PublicCheckin() {
  const { sessionId } = useParams({ from: "/checkin/$sessionId" });
  const get = useServerFn(getPublicCheckinSession);
  const submit = useServerFn(publicCheckin);
  const { data } = useQuery({ queryKey: ["pub-checkin", sessionId], queryFn: () => get({ data: { id: sessionId } }) });
  const [done, setDone] = useState(false);

  const mut = useMutation({
    mutationFn: (p: any) => submit({ data: p }),
    onSuccess: () => { setDone(true); toast.success("Check-in registrado!"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!data) return <div className="p-6 text-center">Carregando…</div>;
  if (!data.session?.active) return <div className="p-6 text-center text-muted-foreground">Sessão encerrada.</div>;

  const accent = data.account?.primary_color || "#467da5";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md p-6 space-y-4">
        {data.account?.brand_logo_url && <img src={data.account.brand_logo_url} alt="" className="h-12 mx-auto" />}
        <div className="text-center">
          <h1 className="text-xl font-bold">{data.account?.brand_title}</h1>
          <p className="text-sm text-muted-foreground">{data.session.title}</p>
        </div>

        {done ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="h-16 w-16 mx-auto" style={{ color: accent }} />
            <p className="font-semibold">Check-in confirmado!</p>
            <p className="text-sm text-muted-foreground">Seja bem-vindo(a) 🙏</p>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mut.mutate({
              session_id: sessionId,
              visitor_name: f.get("name"),
              visitor_phone: f.get("phone") || null,
            });
          }} className="space-y-3">
            <div><Label>Seu nome*</Label><Input name="name" required /></div>
            <div><Label>WhatsApp (opcional)</Label><Input name="phone" type="tel" /></div>
            <Button type="submit" className="w-full" style={{ backgroundColor: accent }} disabled={mut.isPending}>
              Confirmar presença
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}