import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccount } from "@/lib/account.functions";
import { updateHubSettings, listMyNews, upsertNews, deleteNews, uploadHubAsset } from "@/lib/hub.functions";
import {
  startInstagramConnect,
  getInstagramConnection,
  disconnectInstagram,
} from "@/lib/instagram.functions";
import { DonationsManager } from "@/components/donations-manager";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ExternalLink, Copy, Upload, Loader2, X, ImagePlus, Plus, Trash2, Pencil, GripVertical,
  Church, Users, HeartHandshake, Cross, Sparkles, Heart, CalendarHeart, CalendarDays,
  HandHeart, BookOpen, Music, Globe, Baby, Home, Flame, Star,
  Settings as SettingsIcon, Image as ImageIcon, Images, LayoutTemplate, Sparkle,
  MessageSquareQuote, Newspaper, Share2, HandCoins, Eye,
  Youtube as YoutubeIcon, Headphones, Instagram as InstagramIcon, Link2, Unlink, CheckCircle2,
} from "lucide-react";

// 4 destaques fixos — ícone e textos padrão pré-montados.
// A igreja só edita o número e (opcionalmente) ajusta o título/subtítulo.
const HIGHLIGHT_SLOTS = [
  {
    icon: "church",
    IconCmp: Church,
    defaultLabel: "Anos de caminhada",
    defaultSublabel: "evangelizando com fé e amor",
    placeholder: "35",
  },
  {
    icon: "users",
    IconCmp: Users,
    defaultLabel: "Famílias acolhidas",
    defaultSublabel: "em comunidade",
    placeholder: "2000",
  },
  {
    icon: "heart-handshake",
    IconCmp: HeartHandshake,
    defaultLabel: "Celebrações",
    defaultSublabel: "vividas em fé",
    placeholder: "5000",
  },
  {
    icon: "calendar-heart",
    IconCmp: CalendarHeart,
    defaultLabel: "Eventos realizados",
    defaultSublabel: "ao longo do ano",
    placeholder: "410",
  },
] as const;

const HIGHLIGHT_ICON_OPTIONS = [
  { value: "church", label: "Igreja", Icon: Church },
  { value: "users", label: "Pessoas", Icon: Users },
  { value: "heart-handshake", label: "Comunhão", Icon: HeartHandshake },
  { value: "cross", label: "Cruz", Icon: Cross },
  { value: "sparkles", label: "Brilho", Icon: Sparkles },
  { value: "heart", label: "Coração", Icon: Heart },
  { value: "calendar-heart", label: "Calendário especial", Icon: CalendarHeart },
  { value: "calendar-days", label: "Calendário", Icon: CalendarDays },
  { value: "hand-heart", label: "Oração e cuidado", Icon: HandHeart },
  { value: "book-open", label: "Bíblia", Icon: BookOpen },
  { value: "music", label: "Música", Icon: Music },
  { value: "globe", label: "Missões", Icon: Globe },
  { value: "baby", label: "Família", Icon: Baby },
  { value: "home", label: "Casa", Icon: Home },
  { value: "flame", label: "Chama", Icon: Flame },
  { value: "star", label: "Estrela", Icon: Star },
] as const;

const HIGHLIGHT_ICON_MAP = Object.fromEntries(
  HIGHLIGHT_ICON_OPTIONS.map((option) => [option.value, option.Icon]),
);

const HUB_TABS = [
  "geral",
  "aparencia",
  "slides",
  "destaques",
  "mensagem",
  "secoes",
  "noticias",
  "midia",
  "contatos",
  "doacoes",
] as const;
type HubTab = (typeof HUB_TABS)[number];

export const Route = createFileRoute("/_authenticated/hub")({
  validateSearch: z.object({
    tab: z.enum(HUB_TABS).optional(),
  }),
  component: HubEditor,
});

const TAB_META: Record<HubTab, { label: string; Icon: any; desc: string }> = {
  geral: { label: "Geral", Icon: SettingsIcon, desc: "Endereço público, status da página e WhatsApp." },
  aparencia: { label: "Galeria", Icon: ImageIcon, desc: "Fotos da comunidade." },
  slides: { label: "Slides", Icon: LayoutTemplate, desc: "Carrossel grande logo abaixo do menu." },
  destaques: { label: "Destaques", Icon: Sparkle, desc: "Números da comunidade com contador animado." },
  mensagem: { label: "Mensagem da semana", Icon: MessageSquareQuote, desc: "Palavra pastoral e versículo." },
  secoes: { label: "Seções visíveis", Icon: Eye, desc: "Ative ou desative módulos do site público." },
  noticias: { label: "Notícias", Icon: Newspaper, desc: "Postagens com foto, título e matéria." },
  midia: { label: "Mídia", Icon: YoutubeIcon, desc: "Vídeos do YouTube e player de áudio (SoundCloud/Spotify)." },
  contatos: { label: "Contatos & Redes", Icon: Share2, desc: "Instagram, YouTube, live, Pix e site." },
  doacoes: { label: "Doações (Pix)", Icon: HandCoins, desc: "Campanhas de doação via Pix da igreja." },
};

type SlideForm = {
  image_url: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_url: string;
  title_size: "sm" | "md" | "lg" | "xl";
};

type HighlightForm = {
  icon: string;
  value: string;
  label: string;
  sublabel: string;
};

type HubForm = {
  hub_enabled: boolean;
  hub_bio: string;
  hub_cover_url: string;
  hub_show_agenda: boolean;
  hub_show_events: boolean;
  hub_show_prayer: boolean;
  hub_show_visitor: boolean;
  hub_show_all_locations: boolean;
  hub_whatsapp: string;
  hub_show_whatsapp: boolean;
  social_instagram: string;
  social_youtube: string;
  social_facebook: string;
  social_website: string;
  live_url: string;
  weekly_message: string;
  weekly_verse: string;
  weekly_verse_ref: string;
  gallery_urls: string[];
  hub_slides: SlideForm[];
  hub_highlights: HighlightForm[];
  media_youtube_url: string;
  media_audio_url: string;
  media_show_youtube: boolean;
  media_show_audio: boolean;
  instagram_post_count: number;
  instagram_columns: number;
};

function HubEditor() {
  const getAccount = useServerFn(getMyAccount);
  const saveHub = useServerFn(updateHubSettings);
  const fetchNews = useServerFn(listMyNews);
  const saveNews = useServerFn(upsertNews);
  const removeNews = useServerFn(deleteNews);
  const signUpload = useServerFn(uploadHubAsset);
  const startIgConnect = useServerFn(startInstagramConnect);
  const fetchIgConnection = useServerFn(getInstagramConnection);
  const disconnectIg = useServerFn(disconnectInstagram);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const slideFileRef = useRef<HTMLInputElement>(null);
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null);
  const newsImageRef = useRef<HTMLInputElement>(null);
  const [uploadingNewsImg, setUploadingNewsImg] = useState(false);

  const { data: account } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => getAccount(),
  });

  const { data: igConnection, refetch: refetchIg } = useQuery({
    queryKey: ["ig-connection"],
    queryFn: () => fetchIgConnection(),
  });

  // Handle ?ig=success|error redirect from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ig = params.get("ig");
    if (!ig) return;
    if (ig === "success") {
      toast.success("Instagram conectado com sucesso!");
      refetchIg();
    } else {
      toast.error("Falha ao conectar Instagram: " + (params.get("ig_msg") || "tente novamente"));
    }
    params.delete("ig");
    params.delete("ig_msg");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? "?" + qs : ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState<HubForm>({
    hub_enabled: true,
    hub_bio: "",
    hub_cover_url: "",
    hub_show_agenda: true,
    hub_show_events: true,
    hub_show_prayer: true,
    hub_show_visitor: true,
    hub_show_all_locations: false,
    hub_whatsapp: "",
    hub_show_whatsapp: true,
    social_instagram: "",
    social_youtube: "",
    social_facebook: "",
    social_website: "",
    live_url: "",
    weekly_message: "",
    weekly_verse: "",
    weekly_verse_ref: "",
    gallery_urls: [],
    hub_slides: [],
    hub_highlights: [],
    media_youtube_url: "",
    media_audio_url: "",
    media_show_youtube: true,
    media_show_audio: true,
    instagram_post_count: 9,
    instagram_columns: 3,
  });

  useEffect(() => {
    if (!account) return;
    setForm({
      hub_enabled: account.hub_enabled ?? true,
      hub_bio: account.hub_bio ?? "",
      hub_cover_url: account.hub_cover_url ?? "",
      hub_show_agenda: account.hub_show_agenda ?? true,
      hub_show_events: account.hub_show_events ?? true,
      hub_show_prayer: account.hub_show_prayer ?? true,
      hub_show_visitor: account.hub_show_visitor ?? true,
      hub_show_all_locations: (account as any).hub_show_all_locations ?? false,
      hub_whatsapp: (account as any).hub_whatsapp ?? (account as any).visitor_whatsapp ?? "",
      hub_show_whatsapp: (account as any).hub_show_whatsapp ?? true,
      social_instagram: account.social_instagram ?? "",
      social_youtube: account.social_youtube ?? "",
      social_facebook: account.social_facebook ?? "",
      social_website: account.social_website ?? "",
      live_url: account.live_url ?? "",
      weekly_message: (account as any).weekly_message ?? "",
      weekly_verse: (account as any).weekly_verse ?? "",
      weekly_verse_ref: (account as any).weekly_verse_ref ?? "",
      gallery_urls: Array.isArray((account as any).gallery_urls)
        ? ((account as any).gallery_urls as string[])
        : [],
      hub_slides: Array.isArray((account as any).hub_slides)
        ? ((account as any).hub_slides as any[]).map((s) => ({
            image_url: s.image_url ?? "",
            title: s.title ?? "",
            subtitle: s.subtitle ?? "",
            cta_label: s.cta_label ?? "",
            cta_url: s.cta_url ?? "",
            title_size: (["sm","md","lg","xl"].includes(s.title_size) ? s.title_size : "lg") as SlideForm["title_size"],
          }))
        : [],
      hub_highlights: Array.isArray((account as any).hub_highlights)
        ? ((account as any).hub_highlights as any[]).map((h) => ({
            icon: h.icon ?? "church",
            value: h.value ?? "",
            label: h.label ?? "",
            sublabel: h.sublabel ?? "",
          }))
        : [],
      media_youtube_url: (account as any).media_youtube_url ?? "",
      media_audio_url: (account as any).media_audio_url ?? "",
      media_show_youtube: (account as any).media_show_youtube ?? true,
      media_show_audio: (account as any).media_show_audio ?? true,
      instagram_post_count: (account as any).instagram_post_count ?? 9,
      instagram_columns: (account as any).instagram_columns ?? 3,
    });
  }, [account]);

  const save = useMutation({
    mutationFn: () =>
      saveHub({
        data: {
          hub_enabled: form.hub_enabled,
          hub_bio: form.hub_bio || null,
          hub_cover_url: form.hub_cover_url || null,
          hub_show_agenda: form.hub_show_agenda,
          hub_show_events: form.hub_show_events,
          hub_show_prayer: form.hub_show_prayer,
          hub_show_visitor: form.hub_show_visitor,
          hub_show_all_locations: form.hub_show_all_locations,
          social_instagram: form.social_instagram || null,
          social_youtube: form.social_youtube || null,
          social_facebook: form.social_facebook || null,
          social_website: form.social_website || null,
          live_url: form.live_url || null,
          hub_whatsapp: form.hub_whatsapp.trim() || null,
          hub_show_whatsapp: form.hub_show_whatsapp,
          weekly_message: form.weekly_message || null,
          weekly_verse: form.weekly_verse || null,
          weekly_verse_ref: form.weekly_verse_ref || null,
          gallery_urls: form.gallery_urls,
          hub_slides: form.hub_slides
            .filter((s) => s.image_url)
            .map((s) => ({
              image_url: s.image_url,
              title: s.title || null,
              subtitle: s.subtitle || null,
              cta_label: s.cta_label || null,
              cta_url: s.cta_url || null,
              title_size: s.title_size || "lg",
            })),
          hub_highlights: (HIGHLIGHT_SLOTS as readonly any[])
            .map((slot: any, idx: number) => {
              const h = form.hub_highlights[idx];
              const num = (h?.value ?? "").trim();
              if (!num) return null;
              return {
                icon: h?.icon || slot.icon,
                value: num,
                label: (h?.label ?? "").trim() || slot.defaultLabel,
                sublabel: (h?.sublabel ?? "").trim() || slot.defaultSublabel || null,
              };
            })
            .filter((x): x is { icon: string; value: string; label: string; sublabel: string | null } => x !== null),
          media_youtube_url: form.media_youtube_url.trim() || null,
          media_audio_url: form.media_audio_url.trim() || null,
          media_show_youtube: form.media_show_youtube,
          media_show_audio: form.media_show_audio,
          instagram_post_count: form.instagram_post_count,
          instagram_columns: form.instagram_columns,
        },
      }),
    onSuccess: () => {
      toast.success("Página atualizada");
      qc.invalidateQueries({ queryKey: ["my-account"] });
      window.dispatchEvent(new Event("hub:refresh-preview"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadCover(file: File) {
    if (!account) return;
    setUploading(true);
    try {
      const url = await uploadViaServer(file, "hub-cover");
      setForm((f) => ({ ...f, hub_cover_url: url }));
      toast.success("Capa enviada");
    } catch (e: any) {
      console.error("uploadCover failed", e);
      toast.error(e?.message || "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  async function uploadGallery(files: FileList) {
    if (!account) return;
    if (form.gallery_urls.length + files.length > 12) {
      toast.error("Máximo 12 fotos na galeria");
      return;
    }
    setUploadingGallery(true);
    const newUrls: string[] = [];
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadViaServer(file, "gallery");
        newUrls.push(url);
      } catch (e: any) {
        console.error("uploadGallery failed for", file.name, e);
        errors.push(`${file.name}: ${e?.message || "falha"}`);
      }
    }
    if (newUrls.length) {
      setForm((f) => ({ ...f, gallery_urls: [...f.gallery_urls, ...newUrls] }));
      toast.success(`${newUrls.length} foto(s) adicionada(s). Não esqueça de salvar.`);
    }
    if (errors.length) toast.error(errors.join(" · "));
    setUploadingGallery(false);
  }

  async function uploadSlideImage(idx: number, file: File) {
    if (!account) return;
    setUploadingSlide(idx);
    try {
      const url = await uploadViaServer(file, "slide");
      setForm((f) => ({
        ...f,
        hub_slides: f.hub_slides.map((s, i) => (i === idx ? { ...s, image_url: url } : s)),
      }));
      toast.success("Imagem do slide enviada");
    } catch (e: any) {
      console.error("uploadSlideImage failed", e);
      toast.error(e?.message || "Falha no upload");
    } finally {
      setUploadingSlide(null);
    }
  }

  async function uploadViaServer(file: File, folder: "hub-cover" | "gallery" | "slide" | "news"): Promise<string> {
    if (file.size > 20 * 1024 * 1024) throw new Error("Arquivo maior que 20MB");

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",")[1] : result);
      };
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });

    const result = await signUpload({
      data: {
        folder,
        filename: file.name || "upload.jpg",
        contentType: file.type || "image/jpeg",
        base64,
      },
    });

    return result.url;
  }

  function addSlide() {
    if (form.hub_slides.length >= 8) {
      toast.error("Máximo 8 slides");
      return;
    }
    setForm((f) => ({
      ...f,
      hub_slides: [...f.hub_slides, { image_url: "", title: "", subtitle: "", cta_label: "", cta_url: "", title_size: "lg" }],
    }));
  }

  function updateSlide(i: number, patch: Partial<SlideForm>) {
    setForm((f) => ({
      ...f,
      hub_slides: f.hub_slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  }

  function moveSlide(i: number, dir: -1 | 1) {
    setForm((f) => {
      const arr = [...f.hub_slides];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...f, hub_slides: arr };
    });
  }

  function removeSlide(i: number) {
    setForm((f) => ({ ...f, hub_slides: f.hub_slides.filter((_, idx) => idx !== i) }));
  }

  const slug = account?.custom_slug || account?.site_id;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const hubUrl = slug ? `${origin}/${slug}` : "";

  const search = useSearch({ strict: false }) as { tab?: HubTab };
  const navigate = useNavigate();
  const tab: HubTab = (search.tab as HubTab) || "geral";
  const setTab = (t: HubTab) =>
    navigate({
      to: "/hub",
      search: { tab: t === "geral" ? undefined : t } as any,
      replace: true,
    });

  return (
    <AppShell>
      <div>
        <div className="mb-5">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {(() => { const M = TAB_META[tab].Icon; return <M className="h-5 w-5 text-muted-foreground" />; })()}
            {TAB_META[tab].label}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {TAB_META[tab].desc}
          </p>
        </div>

        <div className="space-y-4">

        {slug && tab === "geral" && (
          <Card className="p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Seu endereço público</p>
              <code className="text-sm font-medium truncate block">{hubUrl}</code>
            </div>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(hubUrl); toast.success("Link copiado"); }}>
              <Copy className="h-3 w-3" />
            </Button>
            <a href={hubUrl} target="_blank" rel="noopener">
              <Button size="sm" variant="outline"><ExternalLink className="h-3 w-3" /></Button>
            </a>
          </Card>
        )}

        {tab === "geral" && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Página ativa</Label>
              <p className="text-xs text-muted-foreground">Quando desligado, a página retorna 404</p>
            </div>
            <Switch checked={form.hub_enabled} onCheckedChange={(v) => setForm({ ...form, hub_enabled: v })} />
          </div>

          <Separator />

          <div>
            <Label>WhatsApp de contato</Label>
            <Input
              value={form.hub_whatsapp}
              onChange={(e) => setForm({ ...form, hub_whatsapp: e.target.value })}
              placeholder="(11) 99999-9999"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Aparece como botão flutuante verde na página da igreja.
            </p>
            {form.hub_show_whatsapp && !form.hub_whatsapp.trim() && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠ Digite um número (com DDD) e clique em Salvar para o botão aparecer no site.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Mostrar botão do WhatsApp</Label>
              <p className="text-xs text-muted-foreground">Exibe o ícone flutuante na página pública</p>
            </div>
            <Switch
              checked={form.hub_show_whatsapp}
              onCheckedChange={(v) => setForm({ ...form, hub_show_whatsapp: v })}
            />
          </div>
        </Card>
        )}

        {tab === "secoes" && (
        <Card className="p-5 space-y-3">
          <h2 className="font-medium">Seções visíveis na página</h2>
          {[
            ["hub_show_agenda", "Agenda de celebrações"],
            ["hub_show_events", "Eventos com inscrição"],
            ["hub_show_prayer", "Pedidos de oração"],
            ["hub_show_visitor", "Formulário de visitantes"],
          ["hub_show_all_locations", "Mostrar todos os endereços na página inicial"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch
                checked={form[key as keyof HubForm] as boolean}
                onCheckedChange={(v) => setForm({ ...form, [key]: v } as HubForm)}
              />
            </div>
          ))}
        </Card>
        )}

        {tab === "midia" && (
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <YoutubeIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium">Últimos vídeos do YouTube</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cole o link do seu canal. Vamos exibir os 5 vídeos mais recentes automaticamente.
                </p>
              </div>
              <Switch
                checked={form.media_show_youtube}
                onCheckedChange={(v) => setForm({ ...form, media_show_youtube: v })}
              />
            </div>
            <div>
              <Label>Link do canal</Label>
              <Input
                value={form.media_youtube_url}
                onChange={(e) => setForm({ ...form, media_youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/@suaigreja"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Aceita formatos: <code>youtube.com/@handle</code>, <code>youtube.com/channel/UC...</code> ou <code>youtube.com/c/nome</code>.
                A lista atualiza sozinha a cada 1 hora.
              </p>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Headphones className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium">Player de áudio</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cole o link de um perfil/playlist do SoundCloud ou de um podcast do Spotify.
                </p>
              </div>
              <Switch
                checked={form.media_show_audio}
                onCheckedChange={(v) => setForm({ ...form, media_show_audio: v })}
              />
            </div>
            <div>
              <Label>Link do SoundCloud ou Spotify</Label>
              <Input
                value={form.media_audio_url}
                onChange={(e) => setForm({ ...form, media_audio_url: e.target.value })}
                placeholder="https://soundcloud.com/suaigreja  ou  https://open.spotify.com/show/..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Aparecerá como bloco "Nossos canais de áudio" na página pública.
              </p>
            </div>
          </Card>
        </div>
        )}

        {tab === "contatos" && (
        <>
        <Card className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              <InstagramIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-medium">Conectar Instagram</h2>
              <p className="text-xs text-muted-foreground">
                Conecte a conta Business/Creator do Instagram da sua igreja para exibir os posts automaticamente na sua página pública.
              </p>
            </div>
          </div>

          {igConnection ? (
            <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    @{igConnection.username || igConnection.ig_user_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Conectado · token expira em {igConnection.token_expires_at
                      ? new Date(igConnection.token_expires_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm("Desconectar o Instagram? Os posts deixarão de aparecer no site.")) return;
                  await disconnectIg();
                  toast.success("Instagram desconectado");
                  refetchIg();
                }}
              >
                <Unlink className="h-4 w-4 mr-1" /> Desconectar
              </Button>
            </div>
          ) : (
            <Button
              onClick={async () => {
                try {
                  const { authorizationUrl } = await startIgConnect();
                  window.location.href = authorizationUrl;
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Falha ao iniciar conexão");
                }
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white"
            >
              <Link2 className="h-4 w-4 mr-2" /> Conectar Instagram
            </Button>
          )}

          {igConnection && (
            <div className="mt-2 grid sm:grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3">
              <div>
                <Label className="text-xs">Quantidade de posts</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  value={form.instagram_post_count}
                  onChange={(e) =>
                    setForm({ ...form, instagram_post_count: Number(e.target.value) })
                  }
                >
                  {[3, 4, 6, 8, 9, 12, 15, 18, 24, 30].map((n) => (
                    <option key={n} value={n}>{n} posts</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Colunas (desktop)</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  value={form.instagram_columns}
                  onChange={(e) =>
                    setForm({ ...form, instagram_columns: Number(e.target.value) })
                  }
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} colunas</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  No celular sempre 2 colunas. Salve para aplicar.
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-medium">Redes sociais e links</h2>
              <p className="text-xs text-muted-foreground">
                Informe os endereços que serão exibidos na página pública da igreja.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Instagram</Label><Input value={form.social_instagram} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} placeholder="https://instagram.com/..." /></div>
            <div><Label>YouTube</Label><Input value={form.social_youtube} onChange={(e) => setForm({ ...form, social_youtube: e.target.value })} placeholder="https://youtube.com/..." /></div>
            <div><Label>Facebook</Label><Input value={form.social_facebook} onChange={(e) => setForm({ ...form, social_facebook: e.target.value })} placeholder="https://facebook.com/..." /></div>
            <div><Label>Site próprio</Label><Input value={form.social_website} onChange={(e) => setForm({ ...form, social_website: e.target.value })} placeholder="https://..." /></div>
            <div className="sm:col-span-2"><Label>Transmissão ao vivo</Label><Input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} placeholder="https://youtube.com/live/..." /></div>
          </div>
        </Card>

        </>
        )}

        {tab === "mensagem" && (
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="font-medium">Versículo da semana</h2>
              <p className="text-xs text-muted-foreground">Exibido em uma faixa de destaque no topo da página.</p>
            </div>
            <div className="grid sm:grid-cols-[1fr_160px] gap-3">
              <div>
                <Label>Versículo</Label>
                <Textarea
                  value={form.weekly_verse}
                  onChange={(e) => setForm({ ...form, weekly_verse: e.target.value })}
                  placeholder="Porque Deus amou o mundo de tal maneira..."
                  maxLength={500}
                  rows={2}
                />
              </div>
              <div>
                <Label>Referência</Label>
                <Input
                  value={form.weekly_verse_ref}
                  onChange={(e) => setForm({ ...form, weekly_verse_ref: e.target.value })}
                  placeholder="João 3:16"
                  maxLength={100}
                />
              </div>
            </div>
          </Card>
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="font-medium">Palavra da semana</h2>
              <p className="text-xs text-muted-foreground">Mensagem pastoral exibida em um card separado, após a galeria.</p>
            </div>
            <div>
              <Label>Mensagem pastoral</Label>
              <Textarea
                value={form.weekly_message}
                onChange={(e) => setForm({ ...form, weekly_message: e.target.value })}
                placeholder="Uma palavra de incentivo para esta semana..."
                maxLength={1000}
                rows={4}
              />
            </div>
          </Card>
        </div>
        )}

        {tab === "aparencia" && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">Galeria de momentos</h2>
              <p className="text-xs text-muted-foreground">Até 12 fotos da sua comunidade</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => galleryRef.current?.click()}
              disabled={uploadingGallery || form.gallery_urls.length >= 12}
            >
              {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Adicionar fotos
            </Button>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) uploadGallery(files);
                e.target.value = "";
              }}
            />
          </div>
          {form.gallery_urls.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded">
              Nenhuma foto ainda
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.gallery_urls.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded overflow-hidden border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gallery_urls: form.gallery_urls.filter((_, idx) => idx !== i) })}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
        )}

        {/* SLIDES */}
        {tab === "slides" && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">Slides do topo</h2>
              <p className="text-xs text-muted-foreground">Carrossel grande abaixo do menu. Até 8 imagens.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addSlide} disabled={form.hub_slides.length >= 8}>
              <Plus className="h-4 w-4" /> Novo slide
            </Button>
          </div>
          {form.hub_slides.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded">
              Nenhum slide. Sem slides, o hub usa a imagem de capa única.
            </p>
          ) : (
            <div className="space-y-4">
              {form.hub_slides.map((s, i) => (
                <div key={i} className="border rounded p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2"><GripVertical className="h-3 w-3" /> Slide {i + 1}</span>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => moveSlide(i, -1)} disabled={i === 0}>↑</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => moveSlide(i, 1)} disabled={i === form.hub_slides.length - 1}>↓</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSlide(i)} className="text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-[200px_1fr] gap-3">
                    <div>
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="w-full aspect-[16/9] object-cover rounded border" />
                      ) : (
                        <div className="w-full aspect-[16/9] rounded border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                      <label className="mt-2 flex">
                        <Button type="button" variant="outline" size="sm" className="w-full" disabled={uploadingSlide === i} asChild>
                          <span>
                            {uploadingSlide === i ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Enviar imagem
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && uploadSlideImage(i, e.target.files[0])}
                        />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Título (opcional)</Label>
                        <Input value={s.title} maxLength={120} onChange={(e) => updateSlide(i, { title: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Tamanho do título</Label>
                        <select
                          value={s.title_size}
                          onChange={(e) => updateSlide(i, { title_size: e.target.value as SlideForm["title_size"] })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        >
                          <option value="sm">Pequeno (textos longos)</option>
                          <option value="md">Médio</option>
                          <option value="lg">Grande (padrão)</option>
                          <option value="xl">Extra grande</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Subtítulo (opcional)</Label>
                        <Input value={s.subtitle} maxLength={200} onChange={(e) => updateSlide(i, { subtitle: e.target.value })} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Texto do botão</Label>
                          <Input value={s.cta_label} maxLength={40} onChange={(e) => updateSlide(i, { cta_label: e.target.value })} placeholder="Saiba mais" />
                        </div>
                        <div>
                          <Label className="text-xs">Link do botão</Label>
                          <Input value={s.cta_url} maxLength={500} onChange={(e) => updateSlide(i, { cta_url: e.target.value })} placeholder="https://..." />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        )}

        {/* HIGHLIGHTS / DESTAQUES */}
        {tab === "destaques" && (
        <Card className="p-5 space-y-4">
          <div>
            <h2 className="font-medium">Destaques da comunidade</h2>
            <p className="text-xs text-muted-foreground">
              4 cards fixos que aparecem no topo da página pública, com contador animado.
              Preencha apenas o <strong>número</strong> (ex.: <code>35</code>, <code>2000</code>).
              Se quiser, ajuste o texto. Deixe o número em branco para esconder o card.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {HIGHLIGHT_SLOTS.map((slot, i) => {
              const h = form.hub_highlights[i] ?? {
                icon: slot.icon, value: "", label: "", sublabel: "",
              };
              const update = (patch: Partial<HighlightForm>) =>
                setForm((f) => {
                  const next = HIGHLIGHT_SLOTS.map((s, idx) => {
                    const cur = f.hub_highlights[idx] ?? {
                      icon: s.icon, value: "", label: "", sublabel: "",
                    };
                    return idx === i ? { ...cur, ...patch } : cur;
                  });
                  return { ...f, hub_highlights: next };
                });
              const Icon = HIGHLIGHT_ICON_MAP[h.icon] ?? slot.IconCmp;
              return (
                <div key={`highlight-${i}`} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div className="text-xs text-muted-foreground">Destaque #{i + 1}</div>
                  </div>
                  <div>
                    <Label className="text-xs">Número</Label>
                    <Input
                      inputMode="numeric"
                      value={h.value}
                      maxLength={10}
                      placeholder={slot.placeholder}
                      onChange={(e) =>
                        update({ value: e.target.value.replace(/[^\d]/g, "").slice(0, 9) })
                      }
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Só números. O "+" e o contador aparecem automaticamente.
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">Ícone</Label>
                    <Select value={h.icon} onValueChange={(icon) => update({ icon })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um ícone" />
                      </SelectTrigger>
                      <SelectContent>
                        {HIGHLIGHT_ICON_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <option.Icon className="h-4 w-4" />
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input
                      value={h.label}
                      maxLength={60}
                      placeholder={slot.defaultLabel}
                      onChange={(e) => update({ label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo (opcional)</Label>
                    <Input
                      value={h.sublabel}
                      maxLength={80}
                      placeholder={slot.defaultSublabel}
                      onChange={(e) => update({ sublabel: e.target.value })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        )}

        {tab !== "noticias" && tab !== "doacoes" && (
          <div className="flex justify-end gap-2 sticky bottom-4 z-10">
            <Link to="/settings"><Button variant="outline">Configurações</Button></Link>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="shadow-lg">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
            </Button>
          </div>
        )}

        {/* NEWS MANAGER (separate saves) */}
        {tab === "noticias" && (
          <NewsManager
            accountId={account?.id}
            fetchNews={fetchNews}
            saveNews={saveNews}
            removeNews={removeNews}
            uploadFile={uploadViaServer}
          />
        )}

        {tab === "doacoes" && (
          <DonationsManager slug={slug} />
        )}

        </div>
      </div>
    </AppShell>
  );
}

type NewsRow = {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string | null;
  published: boolean;
  sort_order: number;
  created_at?: string;
};

function NewsManager({
  accountId, fetchNews, saveNews, removeNews, uploadFile,
}: {
  accountId: string | undefined;
  fetchNews: () => Promise<NewsRow[]>;
  saveNews: (args: { data: NewsRow }) => Promise<any>;
  removeNews: (args: { data: { id: string } }) => Promise<any>;
  uploadFile: (file: File, folder: "hub-cover" | "gallery" | "slide" | "news") => Promise<string>;
}) {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({
    queryKey: ["my-news"],
    queryFn: () => fetchNews(),
    enabled: !!accountId,
  });

  const empty: NewsRow = { title: "", subtitle: "", content: "", image_url: null, published: true, sort_order: 0 };
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: (row: NewsRow) => saveNews({ data: row }),
    onSuccess: () => {
      toast.success("Notícia salva");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["my-news"] });
      window.dispatchEvent(new Event("hub:refresh-preview"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => removeNews({ data: { id } }),
    onSuccess: () => {
      toast.success("Notícia removida");
      qc.invalidateQueries({ queryKey: ["my-news"] });
      window.dispatchEvent(new Event("hub:refresh-preview"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadNewsImage(file: File) {
    if (!accountId || !editing) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "news");
      setEditing({ ...editing, image_url: url });
    } catch (e: any) {
      console.error("uploadNewsImage failed", e);
      toast.error(e?.message || "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium">Notícias</h2>
          <p className="text-xs text-muted-foreground">Postagens simples que aparecem no hub: foto, título, subtítulo e texto.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing({ ...empty, sort_order: list.length })}>
          <Plus className="h-4 w-4" /> Nova notícia
        </Button>
      </div>

      {list.length === 0 && !editing && (
        <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded">
          Nenhuma notícia ainda
        </p>
      )}

      <div className="space-y-2">
        {list.map((n) => (
          <div key={n.id} className="flex items-center gap-3 border rounded p-2">
            <div className="w-16 h-12 rounded bg-stone-100 overflow-hidden shrink-0">
              {n.image_url && <img src={n.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{n.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {n.published ? "Publicada" : "Rascunho"} · {n.subtitle || "—"}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing({ ...n })}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Duplicar"
              onClick={() =>
                setEditing({
                  title: `${n.title} (cópia)`,
                  subtitle: n.subtitle ?? "",
                  content: n.content ?? "",
                  image_url: n.image_url ?? null,
                  published: false,
                  sort_order: (n.sort_order ?? 0),
                })
              }
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => n.id && del.mutate(n.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="border rounded p-4 space-y-3 bg-muted/30">
          <div>
            <Label>Imagem</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={editing.image_url ?? ""}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value || null })}
                placeholder="URL da imagem"
              />
              <Button type="button" variant="outline" disabled={uploading} onClick={() => document.getElementById("news-img-input")?.click()}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
              <input
                id="news-img-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadNewsImage(e.target.files[0])}
              />
            </div>
            {editing.image_url && (
              <img src={editing.image_url} alt="" className="mt-2 w-full h-40 object-cover rounded" />
            )}
          </div>
          <div>
            <Label>Título</Label>
            <Input value={editing.title} maxLength={200} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={editing.subtitle} maxLength={300} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
          </div>
          <div>
            <Label>Matéria</Label>
            <Textarea
              value={editing.content}
              maxLength={10000}
              rows={5}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
              <Label className="text-sm">Publicada</Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button
                type="button"
                disabled={save.isPending || !editing.title}
                onClick={() => save.mutate(editing)}
              >
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar notícia"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
