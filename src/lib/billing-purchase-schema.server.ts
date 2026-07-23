import { z } from "zod";
import { PURCHASABLE_PLAN_IDS } from "@/lib/billing-plans";

// Contrato server-side do checkout. Não deve aceitar IDs legados/anuais mesmo
// quando a chamada não vier da interface de assinatura.
export const createPixPaymentInputSchema = z.object({
  plan: z.enum(PURCHASABLE_PLAN_IDS),
});
