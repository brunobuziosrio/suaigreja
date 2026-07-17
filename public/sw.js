// Cache leve para a parte pública instalável. Dados autenticados e APIs nunca
// entram no cache para não expor informações de uma conta em outro dispositivo.
const CACHE_NAME = "suaigreja-public-v2";
const PRIVATE_PATHS = new Set([
  "/dashboard", "/membros", "/agenda", "/eventos", "/campanhas", "/finances", "/livro-caixa",
  "/whatsapp", "/secretaria", "/equipe", "/settings", "/relatorios", "/privacidade", "/billing",
  "/admin", "/checkin", "/checkin-infantil", "/escalas", "/ausencias", "/celulas", "/familias",
  "/ministerios", "/congregacoes", "/contas-bancarias", "/reservas", "/patrimonio", "/acao-social",
  "/decisoes", "/devocional", "/documentos", "/ebd", "/festinhas", "/onboarding", "/oracoes",
  "/transmissoes", "/visitantes", "/locations", "/types", "/hub", "/embed", "/marketplace",
]);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("suaigreja-public-") && key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/_authenticated") || PRIVATE_PATHS.has(url.pathname) || url.pathname.startsWith("/admin/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || new Response("Você está offline.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })),
    );
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname === "/manifest.json" || url.pathname.startsWith("/manifest/")) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    })));
  }
});
