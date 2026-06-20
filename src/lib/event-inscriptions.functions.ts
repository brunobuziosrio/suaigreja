/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

export const createEventInscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        event_id: z.string().uuid(),
        full_name: z.string().min(1).max(160),
        email: z.string().email(),
        phone: z.string().max(20),
        attendance_count: z.number().int().min(1).max(100).default(1),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Check event exists and has capacity
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, max_inscriptions, current_inscriptions, price_cents")
      .eq("id", data.event_id)
      .eq("account_id", userId)
      .single();

    if (eventErr) throw new Error("Evento não encontrado");

    const maxSeats = event?.max_inscriptions || 999;
    const currentSeats = event?.current_inscriptions || 0;

    if (currentSeats + data.attendance_count > maxSeats) {
      throw new Error(
        `Vagas insuficientes. Disponíveis: ${maxSeats - currentSeats}`
      );
    }

    const totalPrice = (event?.price_cents || 0) * data.attendance_count;

    const { data: inscription, error: inscErr } = await supabase
      .from("event_inscriptions")
      .insert({
        event_id: data.event_id,
        account_id: userId,
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        attendance_count: data.attendance_count,
        total_price_cents: totalPrice,
        status: "confirmed",
        inscribed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (inscErr) throw new Error(inscErr.message);

    // Update event inscription count
    await supabase
      .from("events")
      .update({
        current_inscriptions: currentSeats + data.attendance_count,
      })
      .eq("id", data.event_id)
      .eq("account_id", userId);

    return { id: inscription?.id, totalPrice };
  });

export const listEventInscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        event_id: z.string().uuid(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: inscriptions, error } = await supabase
      .from("event_inscriptions")
      .select("*")
      .eq("event_id", data.event_id)
      .eq("account_id", userId)
      .order("inscribed_at", { ascending: false });

    if (error) throw new Error(error.message);
    return inscriptions ?? [];
  });

export const generateQRCodeForInscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        inscription_id: z.string().uuid(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: inscription, error } = await supabase
      .from("event_inscriptions")
      .select("*, events(id, name)")
      .eq("id", data.inscription_id)
      .eq("account_id", userId)
      .single();

    if (error) throw new Error(error.message);

    // Generate QR code data (typically a URL with verification token)
    const qrData = `https://igrejasaas.app/check-in/${inscription.id}`;

    return {
      inscription_id: inscription.id,
      qr_data: qrData,
      event_name: inscription.events?.name,
      participant_name: inscription.full_name,
    };
  });

export const recordEventAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        inscription_id: z.string().uuid(),
        checked_in: z.boolean().default(true),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabase
      .from("event_inscriptions")
      .update({
        checked_in: data.checked_in,
        checked_in_at: data.checked_in ? new Date().toISOString() : null,
      })
      .eq("id", data.inscription_id)
      .eq("account_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const generateEventCertificate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        inscription_id: z.string().uuid(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: inscription, error: inscErr } = await supabase
      .from("event_inscriptions")
      .select("*, events(name, event_date)")
      .eq("id", data.inscription_id)
      .eq("account_id", userId)
      .single();

    if (inscErr) throw new Error(inscErr.message);

    if (!inscription.checked_in) {
      throw new Error("Participante não confirmou presença");
    }

    const certificateData = {
      participant_name: inscription.full_name,
      event_name: inscription.events?.name,
      event_date: inscription.events?.event_date,
      issued_at: new Date().toISOString(),
      certificate_id: inscription.id,
    };

    return certificateData;
  });

export const exportEventInscriptionsToCSV = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        event_id: z.string().uuid(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: inscriptions, error } = await supabase
      .from("event_inscriptions")
      .select("*")
      .eq("event_id", data.event_id)
      .eq("account_id", userId)
      .order("inscribed_at", { ascending: true });

    if (error) throw new Error(error.message);

    const csv =
      "Nome,Email,Telefone,Quantidade,Valor Total,Status,Check-in,Data Inscrição\n" +
      (inscriptions ?? [])
        .map(
          (i: any) =>
            `"${i.full_name}","${i.email}","${i.phone}",${i.attendance_count},"R$ ${(i.total_price_cents / 100).toFixed(2)}","${i.status}","${i.checked_in ? "Sim" : "Não"}","${i.inscribed_at}"`
        )
        .join("\n");

    return { csv, filename: `inscricoes-evento-${data.event_id}.csv` };
  });
