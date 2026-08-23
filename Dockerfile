# syntax=docker/dockerfile:1.9
#
# Builds the static site and serves it with nginx. Used for the Coolify tester
# preview; production is Cloudflare Pages, which builds from source and never
# touches this image.
#
#   docker build -t myridesg-site .
#   docker run --rm -p 8080:8080 myridesg-site
#
# SITE_URL is baked in at build time. A static build has no runtime to read env
# from, so this MUST be a build arg — a runtime variable arrives too late.
# In Coolify: add it as an environment variable and tick "Build Variable".
#   docker build --build-arg SITE_URL=https://staging.myridesg.com .

FROM node:22-bookworm-slim AS base
RUN corepack enable
WORKDIR /app
ENV CI=true

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG SITE_URL=https://myridesg.com
ENV SITE_URL=${SITE_URL}
RUN pnpm build

# Served by gzip_static, so nginx spends no CPU compressing per request.
RUN find dist -type f \
      \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.mjs' \
      -o -name '*.svg' -o -name '*.json' -o -name '*.xml' -o -name '*.txt' \) \
      -size +1k -exec gzip -9 -k {} +

# CI gate, off the runtime path: docker build --target check .
FROM build AS check
RUN pnpm check

FROM nginx:alpine AS runtime
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
