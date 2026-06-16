import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getPublicAgenda } from "@/lib/public-agenda.functions";
import { PublicAgendaView } from "@/components/public-agenda-view";
import { getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { BackToSite } from "@/components/back-to-site";
import { PublicHero } from "@/components/public-hero";
import { CalendarDays } from "lucide-react";

type PublicData = {
  account: {
    brand_title: string;
    brand_subtitle: string;
    brand_empty_message: string;
    brand_today_title: string;
    primary_color: string;
    force_show_type?: boolean | null;
  };
  events: Array<{
    id: string;
    event_date: string;
    start_time: string;
    end_time: string | null;
    location_name: string;
    type_name: string;
    type_id: string | null;
    description: string | null;
    show_type: boolean;
    is_live: boolean;
    live_url: string | null;
  }>;
  types: Array<{ id: string; name: string; color: string; icon: string }>;
};

const searchSchema = z.object({
  view: z.enum(["full", "summary"]).optional(),
});

export const Route = createFileRoute("/a/$siteId")({
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const [data, chrome] = await Promise.all([
      getPublicAgenda({ data: { siteId: params.siteId } }),
      getHubChrome({ data: { siteId: params.siteId } }),
    ]);
    if (!data) throw notFound();
    return { ...(data as PublicData), chrome };
  },
  component: PublicAgenda,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Agenda não encontrada</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Verifique o endereço informado.
        </p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.account.brand_title ?? "Agenda" },
      {
        name: "description",
        content:
          loaderData?.account.brand_subtitle ||
          "Próximas celebrações e horários.",
      },
    ],
  }),
});

function PublicAgenda() {
  const { account, events, types, chrome } = Route.useLoaderData();
  const params = Route.useParams();
  const { view } = Route.useSearch();
  const grouped = new Map<string, typeof events>();
  for (const e of events) {
    const arr = grouped.get(e.event_date) ?? [];
    arr.push(e);
    grouped.set(e.event_date, arr);
  }
  const hasMore = view === "summary" && grouped.size > 1;

  const content = (
    <>
      <PublicHero
        color={account.primary_color || "#467da5"}
        title="Agenda"
        subtitle={account.brand_title}
        icon={<CalendarDays className="h-10 w-10" />}
        slug={params.siteId}
      />
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <PublicAgendaView account={account} events={events} types={types} view={view} />
        {hasMore && (
          <p className="text-center text-xs text-slate-500 mt-3">
            Agenda completa disponível no site.
          </p>
        )}
      </div>
    </>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{content}</HubChrome>;

  return (
    <div className="min-h-screen bg-[#faf6ee]">
      <main>{content}</main>
    </div>
  );
}