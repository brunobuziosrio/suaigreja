import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-CrQ0iXNE.js";
import { useRef, useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { l as listLocations, u as upsertLocation, d as deleteLocation } from "./locations.functions-BuQu5la6.js";
import { g as getMyAccount } from "./account.functions-DK5H0Kdx.js";
import { g as getProfile } from "./religion-profiles-CyOvWaWi.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { Plus, Star, Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./admin-payment-settings.functions-DPCtUTO2.js";
import "./server-aNfUBU9s.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CuIHMyp3.js";
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./router-BAWvi9U-.js";
import "./client-DVtn2Z4s.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
function loadMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window;
  if (w.google?.maps?.places) return Promise.resolve();
  return Promise.reject(new Error("Chave do Google Maps ausente"));
}
function extractComponents(components) {
  const get = (type) => components.find((c) => (c.types || []).includes(type))?.long_name ?? null;
  return {
    neighborhood: get("sublocality_level_1") ?? get("sublocality") ?? get("neighborhood"),
    city: get("administrative_area_level_2") ?? get("locality"),
    state: get("administrative_area_level_1"),
    postal_code: get("postal_code"),
    country: get("country")
  };
}
function PlaceAutocomplete({
  value,
  onPick,
  onTextChange,
  placeholder
}) {
  const containerRef = useRef(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let element = null;
    let cancelled = false;
    loadMaps().then(async () => {
      if (cancelled || !containerRef.current) return;
      const g = window.google;
      const { PlaceAutocompleteElement } = await g.maps.importLibrary("places");
      element = new PlaceAutocompleteElement();
      element.style.width = "100%";
      if (value) element.value = value;
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(element);
      element.addEventListener("gmp-select", async (ev) => {
        try {
          const placePrediction = ev.placePrediction;
          const place = placePrediction.toPlace();
          await place.fetchFields({
            fields: ["id", "formattedAddress", "location", "addressComponents"]
          });
          const lat = place.location?.lat();
          const lng = place.location?.lng();
          if (typeof lat !== "number" || typeof lng !== "number") return;
          const comps = (place.addressComponents || []).map((c) => ({
            long_name: c.longText,
            short_name: c.shortText,
            types: c.types
          }));
          const extracted = extractComponents(comps);
          const picked = {
            formatted_address: place.formattedAddress || "",
            latitude: lat,
            longitude: lng,
            place_id: place.id,
            ...extracted
          };
          onPick(picked);
          onTextChange?.(picked.formatted_address);
        } catch (e) {
          setErr(e?.message ?? "Erro ao ler endereço");
        }
      });
      element.addEventListener("input", () => {
        onTextChange?.(element.value ?? "");
      });
    }).catch((e) => setErr(e.message));
    return () => {
      cancelled = true;
      if (element && containerRef.current?.contains(element)) {
        containerRef.current.removeChild(element);
      }
    };
  }, []);
  {
    return /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2", children: "Google Maps não configurado." });
  }
}
function MapPreview({
  latitude,
  longitude,
  height = 220
}) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "rounded-md border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-xs text-stone-500",
        style: { height },
        children: "Selecione um endereço para ver o mapa"
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      title: "Pré-visualização do mapa",
      src: `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`,
      className: "w-full rounded-md border border-stone-200",
      style: { height },
      loading: "lazy",
      referrerPolicy: "no-referrer-when-downgrade"
    }
  );
}
const empty = {
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
  country: null
};
function LocationsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listLocations);
  const fetchAccount = useServerFn(getMyAccount);
  const save = useServerFn(upsertLocation);
  const remove = useServerFn(deleteLocation);
  const {
    data: account
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount()
  });
  const {
    data: items = [],
    isLoading
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => fetchList()
  });
  account ? getProfile(account.religion_profile) : null;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const upsertMut = useMutation({
    mutationFn: (input) => save({
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
        country: input.country
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["locations"]
      });
      toast.success("Local salvo");
      setOpen(false);
      setForm(empty);
    },
    onError: (e) => toast.error(e.message)
  });
  const deleteMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["locations"]
      });
      toast.success("Local removido");
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Nosso endereço" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cadastre a Matriz e, se houver, filiais, capelas ou unidades. Use a busca para fixar o pino exato." })
      ] }),
      /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (!o) setForm(empty);
      }, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Novo endereço"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Editar local" : "Novo local" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Nome" }),
              /* @__PURE__ */ jsx(Input, { id: "name", value: form.name, onChange: (e) => setForm({
                ...form,
                name: e.target.value
              }), placeholder: "Ex: Matriz São José" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Endereço (Google)" }),
              /* @__PURE__ */ jsx(PlaceAutocomplete, { value: form.address, onTextChange: (t) => setForm((f) => ({
                ...f,
                address: t
              })), onPick: (p) => setForm((f) => ({
                ...f,
                address: p.formatted_address,
                latitude: p.latitude,
                longitude: p.longitude,
                place_id: p.place_id,
                neighborhood: p.neighborhood,
                city: p.city,
                state: p.state,
                postal_code: p.postal_code,
                country: p.country
              })), placeholder: "Digite e selecione o endereço exato" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Selecione um resultado para fixar a localização exata (pino)." }),
              /* @__PURE__ */ jsx(MapPreview, { latitude: form.latitude, longitude: form.longitude }),
              form.latitude && form.longitude && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-emerald-700", children: [
                "✓ Coordenadas: ",
                form.latitude.toFixed(6),
                ", ",
                form.longitude.toFixed(6),
                form.neighborhood ? ` • ${form.neighborhood}` : "",
                form.city ? ` • ${form.city}` : "",
                form.state ? `/${form.state}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "Telefone" }),
                /* @__PURE__ */ jsx(Input, { id: "phone", value: form.phone, onChange: (e) => setForm({
                  ...form,
                  phone: e.target.value
                }), placeholder: "(00) 0000-0000" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "whatsapp", children: "WhatsApp" }),
                /* @__PURE__ */ jsx(Input, { id: "whatsapp", value: form.whatsapp, onChange: (e) => setForm({
                  ...form,
                  whatsapp: e.target.value
                }), placeholder: "(00) 90000-0000" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "office_hours", children: "Horário da secretaria" }),
              /* @__PURE__ */ jsx(Textarea, { id: "office_hours", rows: 2, value: form.office_hours, onChange: (e) => setForm({
                ...form,
                office_hours: e.target.value
              }), placeholder: "Ex: Seg a Sex, 8h às 17h • Sáb 8h às 12h" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "transport_info", children: "Transporte público próximo" }),
              /* @__PURE__ */ jsx(Textarea, { id: "transport_info", rows: 2, value: form.transport_info, onChange: (e) => setForm({
                ...form,
                transport_info: e.target.value
              }), placeholder: "Ex: Linhas 100, 220 • Metrô Estação Centro (5 min a pé)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/30 p-3 space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Links de navegação (opcional)" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Se deixar em branco, geramos automaticamente a partir do endereço." }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "maps_url", className: "text-xs", children: "Google Maps" }),
                /* @__PURE__ */ jsx(Input, { id: "maps_url", value: form.maps_url, onChange: (e) => setForm({
                  ...form,
                  maps_url: e.target.value
                }), placeholder: "https://maps.app.goo.gl/..." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "waze_url", className: "text-xs", children: "Waze" }),
                /* @__PURE__ */ jsx(Input, { id: "waze_url", value: form.waze_url, onChange: (e) => setForm({
                  ...form,
                  waze_url: e.target.value
                }), placeholder: "https://waze.com/ul?ll=..." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "uber_url", className: "text-xs", children: "Uber" }),
                /* @__PURE__ */ jsx(Input, { id: "uber_url", value: form.uber_url, onChange: (e) => setForm({
                  ...form,
                  uber_url: e.target.value
                }), placeholder: "https://m.uber.com/ul/?action=setPickup..." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: "is_main", className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5" }),
                  " Marcar como Matriz"
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Aparece em destaque no site." })
              ] }),
              /* @__PURE__ */ jsx(Switch, { id: "is_main", checked: form.is_main, onCheckedChange: (v) => setForm({
                ...form,
                is_main: v
              }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "active", children: "Ativo" }),
              /* @__PURE__ */ jsx(Switch, { id: "active", checked: form.active, onCheckedChange: (v) => setForm({
                ...form,
                active: v
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxs(Button, { disabled: !form.name.trim() || upsertMut.isPending, onClick: () => upsertMut.mutate(form), children: [
              upsertMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
              "Salvar"
            ] })
          ] })
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : items.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(MapPin, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Nenhum local ainda" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cadastre o primeiro local para começar a montar a sua agenda." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: items.map((l) => /* @__PURE__ */ jsxs(Card, { className: "p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: l.name }),
          l.is_main && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider", children: "Matriz" }),
          !l.active && /* @__PURE__ */ jsx("span", { className: "text-xs bg-muted px-2 py-0.5 rounded", children: "Inativo" })
        ] }),
        l.address && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground truncate mt-0.5", children: l.address })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1 shrink-0", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          setForm({
            id: l.id,
            name: l.name,
            address: l.address ?? "",
            active: l.active,
            is_main: l.is_main ?? false,
            phone: l.phone ?? "",
            whatsapp: l.whatsapp ?? "",
            office_hours: l.office_hours ?? "",
            transport_info: l.transport_info ?? "",
            maps_url: l.maps_url ?? "",
            waze_url: l.waze_url ?? "",
            uber_url: l.uber_url ?? "",
            latitude: l.latitude ?? null,
            longitude: l.longitude ?? null,
            place_id: l.place_id ?? null,
            neighborhood: l.neighborhood ?? null,
            city: l.city ?? null,
            state: l.state ?? null,
            postal_code: l.postal_code ?? null,
            country: l.country ?? null
          });
          setOpen(true);
        }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          if (confirm(`Remover "${l.name}"?`)) deleteMut.mutate(l.id);
        }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
      ] })
    ] }, l.id)) })
  ] }) });
}
export {
  LocationsPage as component
};
