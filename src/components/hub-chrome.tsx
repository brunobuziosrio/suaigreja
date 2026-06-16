import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Instagram, Youtube, Facebook, Globe, MessageCircle,
  Menu, X as XIcon, Heart,
} from "lucide-react";

export type HubChromeAccount = {
  brand_title: string;
  brand_logo_url?: string | null;
  brand_logo_height_px?: number | null;
  hub_bio?: string | null;
  primary_color?: string | null;
  custom_slug?: string | null;
  site_id?: string | null;
  hub_show_agenda?: boolean | null;
  hub_show_prayer?: boolean | null;
  hub_show_visitor?: boolean | null;
  hub_show_events?: boolean | null;
  social_instagram?: string | null;
  social_youtube?: string | null;
  social_facebook?: string | null;
  social_website?: string | null;
  visitor_whatsapp?: string | null;
  live_url?: string | null;
  pix_key?: string | null;
};

function buildNav(account: HubChromeAccount, slug: string) {
  const items: { label: string; href: string; external?: boolean }[] = [
    { label: "Início", href: `/${slug}` },
  ];
  if (account.hub_show_agenda) items.push({ label: "Agenda", href: `/a/${slug}` });
  if (account.hub_show_events) items.push({ label: "Eventos", href: `/eventos/${slug}` });
  items.push({ label: "Notícias", href: `/n/${slug}` });
  items.push({ label: "Transmissões", href: `/${slug}#transmissoes` });
  if (account.hub_show_prayer) items.push({ label: "Oração", href: `/o/${slug}` });
  items.push({ label: "Doações", href: `/d/${slug}` });
  return items;
}

function socialsFrom(account: HubChromeAccount) {
  const wa = (account.visitor_whatsapp || "").replace(/\D/g, "");
  return [
    account.social_instagram && { href: account.social_instagram, Icon: Instagram, label: "Instagram" },
    account.social_youtube && { href: account.social_youtube, Icon: Youtube, label: "YouTube" },
    account.social_facebook && { href: account.social_facebook, Icon: Facebook, label: "Facebook" },
    wa && { href: `https://wa.me/${wa}`, Icon: MessageCircle, label: "WhatsApp" },
    account.social_website && { href: account.social_website, Icon: Globe, label: "Site" },
  ].filter(Boolean) as { href: string; Icon: any; label: string }[];
}

export function HubChrome({
  account,
  children,
  contained = true,
}: {
  account: HubChromeAccount;
  children: ReactNode;
  contained?: boolean;
}) {
  const accent = account.primary_color || "#7d9b76";
  const slug = account.custom_slug || account.site_id || "";
  const nav = buildNav(account, slug);
  const socials = socialsFrom(account);

  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-800"
      style={{ ["--accent" as any]: accent }}
    >
      <HubTopNav
        brandTitle={account.brand_title}
        logoUrl={account.brand_logo_url ?? null}
        logoHeight={account.brand_logo_height_px ?? 32}
        accent={accent}
        items={nav}
        liveUrl={account.live_url ?? null}
        slug={slug}
      />
      <main className="flex-1">
        {contained ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <HubFooter account={account} accent={accent} nav={nav} socials={socials} />
    </div>
  );
}

function HubTopNav({
  brandTitle, logoUrl, logoHeight, accent, items, liveUrl, slug,
}: {
  brandTitle: string; logoUrl: string | null; logoHeight: number;
  accent: string; slug: string;
  items: { label: string; href: string }[];
  liveUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`sticky top-0 z-40 transition-colors ${scrolled ? "bg-white/95 backdrop-blur border-b border-stone-200" : "bg-white/85 backdrop-blur border-b border-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/$slug" params={{ slug }} className="flex items-center gap-2 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandTitle}
              style={{ height: Math.min(Math.max(logoHeight, 16), 48) }}
              className="w-auto object-contain shrink-0"
            />
          ) : (
            <>
              <span
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: accent }}
              >
                {brandTitle?.[0]?.toUpperCase() ?? "S"}
              </span>
              <span className="font-medium text-sm text-stone-900 truncate">
                {brandTitle}
              </span>
            </>
          )}
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="px-3 py-1.5 text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900 rounded transition"
            >
              {it.label}
            </a>
          ))}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener"
              className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold transition hover:opacity-90"
              style={{ background: accent }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-white" />
              </span>
              Ao vivo
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded text-stone-700 hover:bg-stone-100"
          aria-label="Abrir menu"
        >
          {open ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-stone-700 border-b border-stone-100 last:border-0"
              >
                {it.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function HubFooter({
  account, accent, nav, socials,
}: {
  account: HubChromeAccount; accent: string;
  nav: { label: string; href: string }[];
  socials: { href: string; Icon: any; label: string }[];
}) {
  return (
    <footer className="mt-10 bg-stone-900 text-stone-300">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: accent }}
            >
              {account.brand_title?.[0]?.toUpperCase() ?? "S"}
            </span>
            <span className="text-lg font-medium text-white">
              {account.brand_title}
            </span>
          </div>
          {account.hub_bio && (
            <p className="mt-4 text-sm leading-relaxed text-stone-400 max-w-xs">{account.hub_bio}</p>
          )}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Navegação</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((it) => (
              <li key={it.href}>
                <a href={it.href} className="hover:text-white transition">{it.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Conecte-se</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener"
                title={s.label}
                className="h-10 w-10 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition"
              >
                <s.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          {account.pix_key && (
            <p className="mt-6 text-xs text-stone-500">
              <span className="font-semibold text-stone-300">Pix:</span>{" "}
              <span className="break-all">{account.pix_key}</span>
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {account.brand_title}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            Feito com <Heart className="h-3 w-3 fill-current" style={{ color: accent }} /> por{" "}
            <a href="/" className="underline underline-offset-2 hover:text-white">suaigreja</a>
          </p>
        </div>
      </div>
    </footer>
  );
}