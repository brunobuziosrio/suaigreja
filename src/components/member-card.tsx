import { useEffect, useState } from "react";
import QRCode from "qrcode";

export type MemberCardData = {
  id: string;
  full_name: string;
  photo_url: string | null;
  role: string;
  status: string;
  member_since: string | null;
  birth_date: string | null;
  cpf: string | null;
  congregation: string | null;
};

export type ChurchCardData = {
  brand_title: string | null;
  card_logo_url: string | null;
  card_logo_height_px: number | null;
  primary_color: string | null;
  card_accent_color: string | null;
  card_footer_text: string | null;
  card_title_size_px?: number | null;
  card_footer_size_px?: number | null;
  card_field_size_px?: number | null;
  card_label_size_px?: number | null;
};

function fmtDate(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}

function fmtCpf(cpf?: string | null) {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Carteirinha 100% em SVG (viewBox 1000x630). Curvas decorativas ficam
 * apenas nas bordas externas (canto sup. esquerdo + canto inf. esquerdo +
 * canto sup. direito), sem invadir a área de campos. Logo e título ficam
 * alinhados à esquerda no topo, FORA das curvas.
 */
export function MemberCard({ member, church, qrValue }: {
  member: MemberCardData;
  church: ChurchCardData;
  qrValue?: string;
}) {
  const primary = church.primary_color || "#0c2340";
  const accent = church.card_accent_color || "#c8102e";
  const logoH = Math.max(24, Math.min(160, church.card_logo_height_px || 72));
  const titleSize = Math.max(18, Math.min(60, church.card_title_size_px || 36));
  const footerSize = Math.max(8, Math.min(20, church.card_footer_size_px || 12));
  const fieldSize = Math.max(10, Math.min(28, church.card_field_size_px || 15));
  const labelSize = Math.max(9, Math.min(20, church.card_label_size_px || 13));
  const footer = church.card_footer_text ||
    "É assegurada nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva Art 5º, VII, Constituição Federal.";

  const [qrUrl, setQrUrl] = useState<string>("");
  useEffect(() => {
    const v = qrValue ?? (typeof window !== "undefined" ? window.location.href : member.id);
    QRCode.toDataURL(v, { width: 320, margin: 0, color: { dark: primary, light: "#ffffff" } })
      .then(setQrUrl).catch(() => {});
  }, [qrValue, member.id, primary]);

  // Logo + título: à esquerda, mas com folga abaixo da curva colorida do
  // canto superior esquerdo para não sobrepor o detalhe azul/vermelho.
  const LOGO_AREA = { x: 60, y: 80, w: 440, h: 90 };
  const logoW = logoH * 2.6;
  const logoX = LOGO_AREA.x;
  const logoY = LOGO_AREA.y + (LOGO_AREA.h - logoH) / 2;

  const Field = ({ x, y, w, label, value }:
    { x: number; y: number; w: number; label: string; value?: string | null }) => (
    <g>
      <text x={x + 4} y={y} fill={primary}
        fontFamily="Inter, system-ui, sans-serif" fontWeight="800"
        fontSize={labelSize} letterSpacing="0.5">{label}:</text>
      <rect x={x} y={y + 8} width={w} height={56} rx={28} ry={28}
        fill="#ffffff" stroke={primary} strokeWidth="2.5" />
      <text x={x + 20} y={y + 44} fill="#2a2a2a"
        fontFamily="Inter, system-ui, sans-serif" fontWeight="600"
        fontSize={fieldSize}>{value || ""}</text>
    </g>
  );

  return (
    <div className="w-full max-w-[720px] mx-auto">
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-white print:shadow-none print:border print:rounded-lg"
        style={{ aspectRatio: "1000 / 700" }}
      >
        <svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg"
             className="absolute inset-0 h-full w-full">
          <rect x="0" y="0" width="1000" height="700" fill="#ffffff" />

          {/* === ARTE: somente nas bordas, não invade área de campos === */}

          {/* Canto SUPERIOR ESQUERDO — pequeno arco */}
          <path d="M0,0 L150,0 C90,30 50,70 30,140 L0,160 Z" fill={accent} />
          <path d="M0,0 L130,0 C80,28 45,65 25,130 L0,148 Z" fill={primary} />

          {/* Canto SUPERIOR DIREITO */}
          <path d="M1000,0 L1000,180 C920,150 850,90 820,0 Z" fill={accent} />
          <path d="M1000,0 L1000,160 C925,135 858,82 835,0 Z" fill={primary} />

          {/* === LOGO + TÍTULO (alinhados à esquerda, FORA das curvas) === */}
          {church.card_logo_url ? (
            <image href={church.card_logo_url}
              x={logoX} y={logoY} height={logoH} width={logoW}
              preserveAspectRatio="xMinYMid meet" />
          ) : (
            church.brand_title ? (
              <text x={LOGO_AREA.x} y={LOGO_AREA.y + LOGO_AREA.h / 2 + 8}
                fill={primary}
                fontFamily="Inter, system-ui, sans-serif" fontWeight="900"
                fontSize="24" letterSpacing="1">
                {church.brand_title.toUpperCase()}
              </text>
            ) : null
          )}

          {/* Título — abaixo da logo, alinhado à esquerda */}
          <text x={LOGO_AREA.x} y={LOGO_AREA.y + LOGO_AREA.h + 38}
            fill={primary}
            fontFamily="Inter, system-ui, sans-serif" fontWeight="900"
            fontSize={titleSize} letterSpacing="0.5">
            CARTEIRA DE MEMBRO
          </text>

          {/* === CAMPOS — começam em x=45 (mesma margem esquerda) === */}
          <Field x={45} y={245} w={700} label="NOME" value={member.full_name} />
          <Field x={45} y={350} w={225} label="CPF" value={fmtCpf(member.cpf)} />
          <Field x={283} y={350} w={225} label="DATA NASC." value={fmtDate(member.birth_date)} />
          <Field x={521} y={350} w={224} label="CADASTRO" value={fmtDate(member.member_since)} />
          <Field x={45} y={455} w={700} label="IGREJA / CONGREGAÇÃO"
            value={member.congregation || church.brand_title || ""} />

          {/* === FOTO (canto superior direito) === */}
          <rect x={765} y={30} width={200} height={235} rx={16} ry={16}
            fill="#ffffff" stroke={primary} strokeWidth="3" />
          {member.photo_url ? (
            <>
              <defs>
                <clipPath id="photoClip">
                  <rect x={765} y={30} width={200} height={235} rx={16} ry={16} />
                </clipPath>
              </defs>
              <image href={member.photo_url} x={765} y={30}
                width={200} height={235}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#photoClip)" />
            </>
          ) : (
            <g>
              <circle cx={865} cy={125} r={38} fill="#d4d4d4" />
              <path d="M795,245 C805,200 865,188 865,188 C865,188 925,200 935,245 L935,260 L795,260 Z"
                fill="#d4d4d4" />
            </g>
          )}

          {/* === QR === */}
          <rect x={765} y={285} width={200} height={210} rx={14} ry={14}
            fill="#ffffff" stroke={primary} strokeWidth="3" />
          {qrUrl ? (
            <image href={qrUrl} x={780} y={305} width={170} height={170}
              preserveAspectRatio="xMidYMid meet" />
          ) : null}

          {/* === RODAPÉ — texto legal centralizado em toda a carteirinha === */}
          <foreignObject x={40} y={560} width={920} height={120}>
            <div
              {...({ xmlns: "http://www.w3.org/1999/xhtml" } as any)}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontStyle: "italic",
                fontSize: footerSize,
                lineHeight: 1.35,
                color: "#444",
                textAlign: "center",
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 8px",
              }}
            >
              {footer}
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
