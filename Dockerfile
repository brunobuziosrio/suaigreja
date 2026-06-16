FROM oven/bun:1.1-debian AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
RUN bun run build

FROM oven/bun:1.1-debian
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000 3001
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
CMD ["sh", "-lc", "bun /app/static-server.js & bun /app/dist/server/server.js"]
