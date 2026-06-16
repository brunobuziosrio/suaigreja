import { useEffect, useRef, useState } from "react";

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

export type PickedPlace = {
  formatted_address: string;
  latitude: number;
  longitude: number;
  place_id: string;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

let loadingPromise: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.google?.maps?.places) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  if (!BROWSER_KEY) return Promise.reject(new Error("Chave do Google Maps ausente"));
  loadingPromise = new Promise<void>((resolve, reject) => {
    const cbName = "__gmapsReadyLov";
    (window as any)[cbName] = () => resolve();
    const s = document.createElement("script");
    const channel = TRACKING_ID ? `&channel=${TRACKING_ID}` : "";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&libraries=places,marker&loading=async&callback=${cbName}${channel}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Falha ao carregar Google Maps"));
    document.head.appendChild(s);
  });
  return loadingPromise;
}

function extractComponents(components: any[]): Omit<PickedPlace, "formatted_address" | "latitude" | "longitude" | "place_id"> {
  const get = (type: string) =>
    components.find((c) => (c.types || []).includes(type))?.long_name ?? null;
  return {
    neighborhood: get("sublocality_level_1") ?? get("sublocality") ?? get("neighborhood"),
    city: get("administrative_area_level_2") ?? get("locality"),
    state: get("administrative_area_level_1"),
    postal_code: get("postal_code"),
    country: get("country"),
  };
}

export function PlaceAutocomplete({
  value,
  onPick,
  onTextChange,
  placeholder,
}: {
  value: string;
  onPick: (p: PickedPlace) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let element: any = null;
    let cancelled = false;
    loadMaps()
      .then(async () => {
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        const { PlaceAutocompleteElement } = await g.maps.importLibrary("places");
        element = new PlaceAutocompleteElement();
        element.style.width = "100%";
        if (value) element.value = value;
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(element);
        element.addEventListener("gmp-select", async (ev: any) => {
          try {
            const placePrediction = ev.placePrediction;
            const place = placePrediction.toPlace();
            await place.fetchFields({
              fields: ["id", "formattedAddress", "location", "addressComponents"],
            });
            const lat = place.location?.lat();
            const lng = place.location?.lng();
            if (typeof lat !== "number" || typeof lng !== "number") return;
            const comps = (place.addressComponents || []).map((c: any) => ({
              long_name: c.longText,
              short_name: c.shortText,
              types: c.types,
            }));
            const extracted = extractComponents(comps);
            const picked: PickedPlace = {
              formatted_address: place.formattedAddress || "",
              latitude: lat,
              longitude: lng,
              place_id: place.id,
              ...extracted,
            };
            onPick(picked);
            onTextChange?.(picked.formatted_address);
          } catch (e: any) {
            setErr(e?.message ?? "Erro ao ler endereço");
          }
        });
        element.addEventListener("input", () => {
          onTextChange?.(element.value ?? "");
        });
      })
      .catch((e) => setErr(e.message));
    return () => {
      cancelled = true;
      if (element && containerRef.current?.contains(element)) {
        containerRef.current.removeChild(element);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!BROWSER_KEY) {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
        Google Maps não configurado.
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} className="[&_gmp-place-autocomplete]:w-full" />
      {err && <p className="text-xs text-destructive mt-1">{err}</p>}
    </div>
  );
}

export function MapPreview({
  latitude,
  longitude,
  height = 220,
}: {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  height?: number;
}) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return (
      <div
        className="rounded-md border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-xs text-stone-500"
        style={{ height }}
      >
        Selecione um endereço para ver o mapa
      </div>
    );
  }
  return (
    <iframe
      title="Pré-visualização do mapa"
      src={`https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`}
      className="w-full rounded-md border border-stone-200"
      style={{ height }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}