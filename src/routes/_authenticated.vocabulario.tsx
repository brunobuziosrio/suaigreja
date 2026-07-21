import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCustomReligionTerms, updateCustomReligionTerms } from "@/lib/account.functions";
import { getReligionTerms, mergeReligionTerms, type ReligionTerms } from "@/lib/religion-profiles";
import { Languages, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vocabulario")({ component: VocabularyPage });

const fields: Array<{ key: keyof ReligionTerms; label: string; hint: string }> = [
  { key: "institution", label: "Instituição", hint: "Ex.: igreja, paróquia, comunidade" },
  { key: "institutionPlural", label: "Unidades", hint: "Ex.: igrejas e congregações" },
  { key: "people", label: "Pessoas", hint: "Ex.: membros, fiéis, participantes" },
  { key: "person", label: "Pessoa", hint: "Ex.: membro, fiel, participante" },
  { key: "smallGroups", label: "Grupos", hint: "Ex.: células, pastorais, pequenos grupos" },
  { key: "mainGathering", label: "Encontro principal", hint: "Ex.: culto, missa, encontro" },
  { key: "contribution", label: "Contribuição", hint: "Ex.: dízimo, oferta, contribuição" },
  { key: "leader", label: "Liderança", hint: "Ex.: pastor, pároco, líder" },
  { key: "secretaryPortal", label: "Secretaria", hint: "Ex.: secretaria paroquial" },
];

function VocabularyPage() {
  const getTerms = useServerFn(getCustomReligionTerms); const saveTerms = useServerFn(updateCustomReligionTerms);
  const { data, isLoading } = useQuery({ queryKey: ["custom-religion-terms"], queryFn: () => getTerms() });
  const [form, setForm] = useState<Partial<ReligionTerms>>({});
  useEffect(() => { if (data) setForm(mergeReligionTerms(data.religion_profile, data.religion_terms)); }, [data]);
  const mutation = useMutation({ mutationFn: () => saveTerms({ data: form as Required<Pick<ReligionTerms, "institution"|"institutionPlural"|"people"|"person"|"smallGroups"|"mainGathering"|"contribution"|"leader"|"secretaryPortal">> }), onSuccess: () => toast.success("Vocabulário salvo"), onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar") });
  const reset = () => { if (data) setForm(getReligionTerms(data.religion_profile)); };
  return <AppShell><div className="mx-auto w-full max-w-5xl space-y-6"><header className="rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background p-6"><div className="flex gap-3"><span className="rounded-lg bg-primary p-2.5 text-primary-foreground"><Languages className="h-6 w-6"/></span><div><h1 className="text-2xl font-semibold">Vocabulário da instituição</h1><p className="mt-1 text-sm text-muted-foreground">Ajuste a linguagem exibida sem alterar dados, permissões ou regras do sistema.</p></div></div></header>{isLoading?<p className="text-sm text-muted-foreground">Carregando...</p>:<><div className="grid gap-3 md:grid-cols-2">{fields.map(({key,label,hint})=><Card key={key} className="p-4"><label className="text-sm font-medium" htmlFor={key}>{label}</label><Input id={key} className="mt-2" value={form[key] ?? ""} maxLength={80} onChange={e=>setForm({...form,[key]:e.target.value})}/><p className="mt-1 text-xs text-muted-foreground">{hint}</p></Card>)}</div><Card className="border-primary/20 bg-primary/[.03] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Prévia</p><p className="mt-2 text-lg font-semibold">{form.people} da sua {form.institution}</p><p className="mt-1 text-sm text-muted-foreground">Organize {form.smallGroups?.toLowerCase()}, publique {form.mainGathering?.toLowerCase()} e acompanhe cada {form.person?.toLowerCase()}.</p></Card><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4"/>Restaurar perfil</Button><Button disabled={mutation.isPending} onClick={()=>mutation.mutate()}>{mutation.isPending&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Salvar vocabulário</Button></div></>}</div></AppShell>;
}
