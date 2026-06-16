import { createFileRoute } from "@tanstack/react-router";
import { verifyState, completeInstagramOAuth } from "@/lib/instagram.functions";

export const Route = createFileRoute("/api/public/instagram/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        const redirectTo = (status: "success" | "error", message?: string) => {
          const dest = new URL("https://suaigreja.top/hub");
          dest.searchParams.set("ig", status);
          if (message) dest.searchParams.set("ig_msg", message);
          return Response.redirect(dest.toString(), 302);
        };

        if (error) {
          return redirectTo("error", errorDescription || error);
        }
        if (!code || !state) {
          return redirectTo("error", "missing_code_or_state");
        }
        const accountId = await verifyState(state);
        if (!accountId) {
          return redirectTo("error", "invalid_state");
        }
        try {
          await completeInstagramOAuth({ accountId, code });
          return redirectTo("success");
        } catch (e) {
          console.error("[instagram callback]", e);
          return redirectTo("error", e instanceof Error ? e.message : "unknown_error");
        }
      },
    },
  },
});