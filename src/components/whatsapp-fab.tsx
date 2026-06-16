import { MessageCircle } from "lucide-react";

type Props = {
  phone?: string;
  message?: string;
};

/**
 * Botão flutuante de WhatsApp para a home de vendas.
 * O número padrão pode ser sobrescrito via VITE_SALES_WHATSAPP no .env
 * ou no painel admin (futuro).
 */
export function WhatsAppFab({
  phone = (import.meta.env.VITE_SALES_WHATSAPP as string | undefined) ?? "5522999090989",
  message = "Olá! Quero conhecer a plataforma suaigreja.",
}: Props) {
  const href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 left-5 z-50 group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_-8px_rgba(37,211,102,0.55)] transition-all hover:scale-[1.03] hover:shadow-[0_18px_50px_-8px_rgba(37,211,102,0.7)] sm:w-auto sm:gap-3 sm:pl-4 sm:pr-5"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
        <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="hidden text-sm font-medium tracking-tight sm:inline">
        Falar no WhatsApp
      </span>
    </a>
  );
}
