import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLocations, upsertLocation, deleteLocation } from "@/lib/locations.functions";
import { getMyAccount } from "@/lib/account.functions";
import { getProfile } from "@/lib/religion-profiles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { PlaceAutocomplete, MapPreview, type PickedPlace } from "@/components/place-autocomplete";

export const Route = createFileRoute("/_authenticated/locations")({
  component: LocationsPage,
});

type LocationForm = {
  id?: string;
  name: string;
  address: string;
  active: boolean;
  is_main: boolean;
  phone: string;
  whatsapp: string;
  office_hours: string;
  transport_info: string;
  maps_url: string;
  waze_url: string;
  uber_url: string;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};
const empty: LocationForm = {
  name: "",
  address: "",
  active: true,
  is_main: false,
  phone: "",
  whatsapp: "",
  office_hours: "",
  transport_info: "",
  maps_url: "",
  waze_url: "",
  uber_url: "",
  latitude: null,
  longitude: null,
  place_id: null,
  neighborhood: null,
  city: null,
  state: null,
  postal_code: null,
  country: null,
};

function LocationsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listLocations);
  const fetchAccount = useServerFn(getMyAccount);
  const save = useServerFn(upsertLocation);
  const remove = useServerFn(deleteLocation);

  const { data: account } = useQuery({ queryKey: ["account"], queryFn: () => fetchAccount() });
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => fetchList(),
  });

  const profile = account ? getProfile(account.religion_profile) : null;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LocationForm>(empty);

  const upsertMut = useMutation({
    mutationFn: (input: LocationForm) =>
      save({
        data: {
          id: input.id,
          name: input.name.trim(),
          address: input.address.trim() || null,
          active: input.active,
          is_main: input.is_main,
          phone: input.phone.trim() || null,
          whatsapp: input.whatsapp.trim() || null,
          office_hours: input.office_hours.trim() || null,
          transport_info: input.transport_info.trim() || null,
          maps_url: input.maps_url.trim() || null,
          waze_url: input.waze_url.trim() || null,
          uber_url: input.uber_url.trim() || null,
          latitude: input.latitude,
          longitude: input.longitude,
          place_id: input.place_id,
          neighborhood: input.neighborhood,
          city: input.city,
          state: input.state,
          postal_code: input.postal_code,
          country: input.country,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Local salvo");
      setOpen(false);
      setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Local removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div>
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
            Nosso endereço
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
            Cadastre a Matriz e, se houver, filiais, capelas ou unidades. Use a busca para fixar o pino exato.
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setForm(empty);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
              Novo endereço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Editar local" : "Novo local"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Matriz São José"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço (Google)</Label>
                  <PlaceAutocomplete
                    value={form.address}
                    onTextChange={(t) => setForm((f) => ({ ...f, address: t }))}
                    onPick={(p: PickedPlace) =>
                      setForm((f) => ({
                        ...f,
                        address: p.formatted_address,
                        latitude: p.latitude,
                        longitude: p.longitude,
                        place_id: p.place_id,
                        neighborhood: p.neighborhood,
                        city: p.city,
                        state: p.state,
                        postal_code: p.postal_code,
                        country: p.country,
                      }))
                    }
                    placeholder="Digite e selecione o endereço exato"
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecione um resultado para fixar a localização exata (pino).
                  </p>
                  <MapPreview latitude={form.latitude} longitude={form.longitude} />
                  {form.latitude && form.longitude && (
                    <p className="text-[11px] text-emerald-700">
                      ✓ Coordenadas: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                      {form.neighborhood ? ` • ${form.neighborhood}` : ""}
                      {form.city ? ` • ${form.city}` : ""}
                      {form.state ? `/${form.state}` : ""}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="(00) 90000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office_hours">Horário da secretaria</Label>
                  <Textarea
                    id="office_hours"
                    rows={2}
                    value={form.office_hours}
                    onChange={(e) => setForm({ ...form, office_hours: e.target.value })}
                    placeholder="Ex: Seg a Sex, 8h às 17h • Sáb 8h às 12h"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transport_info">Transporte público próximo</Label>
                  <Textarea
                    id="transport_info"
                    rows={2}
                    value={form.transport_info}
                    onChange={(e) => setForm({ ...form, transport_info: e.target.value })}
                    placeholder="Ex: Linhas 100, 220 • Metrô Estação Centro (5 min a pé)"
                  />
                </div>
                <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Links de navegação (opcional)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Se deixar em branco, geramos automaticamente a partir do endereço.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="maps_url" className="text-xs">Google Maps</Label>
                    <Input
                      id="maps_url"
                      value={form.maps_url}
                      onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waze_url" className="text-xs">Waze</Label>
                    <Input
                      id="waze_url"
                      value={form.waze_url}
                      onChange={(e) => setForm({ ...form, waze_url: e.target.value })}
                      placeholder="https://waze.com/ul?ll=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uber_url" className="text-xs">Uber</Label>
                    <Input
                      id="uber_url"
                      value={form.uber_url}
                      onChange={(e) => setForm({ ...form, uber_url: e.target.value })}
                      placeholder="https://m.uber.com/ul/?action=setPickup..."
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div>
                    <Label htmlFor="is_main" className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5" /> Marcar como Matriz
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Aparece em destaque no site.
                    </p>
                  </div>
                  <Switch
                    id="is_main"
                    checked={form.is_main}
                    onCheckedChange={(v) => setForm({ ...form, is_main: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativo</Label>
                  <Switch
                    id="active"
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={!form.name.trim() || upsertMut.isPending}
                  onClick={() => upsertMut.mutate(form)}
                >
                  {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhum local ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre o primeiro local para começar a montar a sua agenda.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {items.map((l) => (
              <Card key={l.id} className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{l.name}</p>
                    {(l as any).is_main && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Matriz
                      </span>
                    )}
                    {!l.active && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inativo</span>
                    )}
                  </div>
                  {l.address && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{l.address}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setForm({
                        id: l.id,
                        name: l.name,
                        address: l.address ?? "",
                        active: l.active,
                        is_main: (l as any).is_main ?? false,
                        phone: (l as any).phone ?? "",
                        whatsapp: (l as any).whatsapp ?? "",
                        office_hours: (l as any).office_hours ?? "",
                        transport_info: (l as any).transport_info ?? "",
                        maps_url: (l as any).maps_url ?? "",
                        waze_url: (l as any).waze_url ?? "",
                        uber_url: (l as any).uber_url ?? "",
                        latitude: (l as any).latitude ?? null,
                        longitude: (l as any).longitude ?? null,
                        place_id: (l as any).place_id ?? null,
                        neighborhood: (l as any).neighborhood ?? null,
                        city: (l as any).city ?? null,
                        state: (l as any).state ?? null,
                        postal_code: (l as any).postal_code ?? null,
                        country: (l as any).country ?? null,
                      });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Remover "${l.name}"?`)) deleteMut.mutate(l.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}