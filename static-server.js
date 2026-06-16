import { readFile } from "fs/promises";
import { extname, normalize, join } from "path";

const root = "/app/dist/client";
const port = Number(process.env.STATIC_PORT || 3001);

const types = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
};

Bun.serve({
  hostname: "0.0.0.0",
  port,
  async fetch(req) {
    try {
      const url = new URL(req.url);
      const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const safePath = normalize(rel);

      if (!safePath || safePath.startsWith("..")) {
        return new Response("Not Found", { status: 404 });
      }

      const filePath = join(root, safePath);
      const data = await readFile(filePath);

      const headers = {
        "Content-Type": types[extname(filePath)] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      };

      if (req.method === "HEAD") {
        return new Response(null, { status: 200, headers });
      }

      return new Response(data, { status: 200, headers });
    } catch (err) {
      if (err && err.code === "ENOENT") {
        return new Response("Not Found", { status: 404 });
      }

      console.error("STATIC_ERROR", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Static server: http://0.0.0.0:${port}`);
