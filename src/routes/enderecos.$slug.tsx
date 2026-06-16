import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublicHub, getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { BackToSite } from "@/components/back-to-site";
import { MapPin, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/enderecos/$slug")({
  loader: async ({ params }) => {
    const [data, chrome] = await Promise.all([
      getPublicHub({ data: { slug: params.slug } }),
      getHubChrome({ data: { siteId: params.slug } }),
    ]);
    if (!data) throw notFound();
    return { ...data, chrome };
  },
  component: LocationsPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Endereços não encontrados</h1>
        <p className="text-sm text-muted-foreground mt-2">Verifique o endereço.</p>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Nossos endereços — ${loaderData?.account?.brand_title ?? ""}` },
      {
        name: "description",
        content: `Todas as unidades, capelas e endereços de ${loaderData?.account?.brand_title ?? "nossa comunidade"}.`,
      },
    ],
  }),
});

function LocationsPage() {
  const { account, locations, chrome } = Route.useLoaderData() as any;
  const accent = account.primary_color || "#7d9b76";
  const slug = account.custom_slug || account.site_id;
  const brand = account.brand_title || "Nossos endereços";
  const list = (locations ?? []).filter((l: any) => l.address);

  const content = (
    <div className="min-h-screen bg-stone-50">
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,.6) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.4) 0, transparent 45%)",
        }} />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <BackToSite slug={slug} className="mb-6" />
          <div className="flex items-center gap-3 text-white/80 text-xs uppercase tracking-[0.3em] font-semibold">
            <MapPin className="h-4 w-4" />
            Venha nos visitar
          </div>
          <h1
            className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nossos endereços
          </h1>
          <p className="mt-3 text-white/85 text-base sm:text-lg max-w-2xl">
            Todas as unidades, capelas e pontos de encontro de {brand}.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {list.length === 0 ? (
          <div className="text-center py-24 text-stone-500">
            <MapPin className="h-10 w-10 mx-auto mb-4 opacity-40" />
            <p>Nenhum endereço cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {list.map((loc: any) => (
              <FullLocationCard key={loc.id ?? loc.name} loc={loc} accent={accent} />
            ))}
          </div>
        )}
      </main>
    </div>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{content}</HubChrome>;
  return content;
}

function FullLocationCard({ loc, accent }: { loc: any; accent: string }) {
  const address = loc.address as string;
  const lat = loc.latitude != null ? Number(loc.latitude) : NaN;
  const lng = loc.longitude != null ? Number(loc.longitude) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const coords = hasCoords ? `${lat},${lng}` : null;

  const mapEmbedSrc = hasCoords
    ? `https://www.google.com/maps?q=${coords}&z=17&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const mapsHref =
    loc.maps_url ||
    (loc.place_id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${loc.place_id}`
      : hasCoords
        ? `https://www.google.com/maps/search/?api=1&query=${coords}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  const wazeHref =
    loc.waze_url ||
    (hasCoords
      ? `https://www.waze.com/ul?ll=${coords}&navigate=yes`
      : `https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`);
  const uberHref =
    loc.uber_url ||
    (hasCoords
      ? `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[formatted_address]=${encodeURIComponent(address)}`
      : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(address)}`);
  const waLink = loc.whatsapp ? `https://wa.me/${String(loc.whatsapp).replace(/\D/g, "")}` : null;
  const telLink = loc.phone ? `tel:${String(loc.phone).replace(/\s/g, "")}` : null;

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition">
      <div className="relative bg-stone-100" style={{ aspectRatio: "4/3" }}>
        <iframe
          title={`Mapa ${loc.name}`}
          src={mapEmbedSrc}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {loc.is_main && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow"
            style={{ background: accent }}
          >
            Matriz
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${accent}1f`, color: accent }}
          >
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3
              className="text-xl tracking-tight text-stone-900 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {loc.name}
            </h3>
            <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">{address}</p>
          </div>
        </div>

        {(loc.office_hours || telLink || waLink) && (
          <div className="space-y-2.5 text-sm border-t border-stone-100 pt-4">
            {loc.office_hours && (
              <p className="text-stone-700 whitespace-pre-line">{loc.office_hours}</p>
            )}
            <div className="flex flex-wrap gap-3 text-stone-700">
              {telLink && (
                <a href={telLink} className="inline-flex items-center gap-1.5 hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {loc.phone}
                </a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Como chegar</p>
          <div className="grid grid-cols-3 gap-2">
            <a href={mapsHref} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700">
              <span className="text-base leading-none">🗺️</span>Maps
            </a>
            <a href={wazeHref} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700">
              <span className="text-base leading-none">🚗</span>Waze
            </a>
            <a href={uberHref} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700">
              <span className="text-base leading-none">🚕</span>Uber
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}