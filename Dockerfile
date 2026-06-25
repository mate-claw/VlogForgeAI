FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates fonts-noto-cjk fonts-noto-color-emoji libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 libgbm1 \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY packages ./packages
COPY template_catalog.json ./template_catalog.json
COPY prisma ./prisma
RUN npm install
RUN npm run typecheck || true

FROM base AS api
CMD ["npm", "run", "start", "-w", "apps/api"]

FROM base AS worker
CMD ["npm", "run", "start", "-w", "apps/worker"]

FROM base AS web
ENV VITE_API_BASE=http://localhost:8787
CMD ["npm", "run", "dev", "-w", "apps/web", "--", "--host", "0.0.0.0"]
