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

# Sanity, for /guides. Build-time only — the site is static, so nothing reaches
# Sanity at runtime and none of this belongs in the nginx stage.
#
# Each needs the ENV line as well as the ARG: Astro reads process.env, and an
# ARG on its own is a build-time substitution the Node process never sees.
# Without them a --build-arg is silently discarded ("one or more build-args were
# not consumed") and the build SUCCEEDS with an empty /guides, which is the one
# failure mode src/lib/content.ts exists to make noisy. Deliberately undefaulted
# so an unset value trips that warning rather than silently pointing somewhere.
#
# .dockerignore excludes .env, so these args are the only way in — a local build
# that works without them is reading your .env, not the args.
ARG SANITY_PROJECT_ID
ARG SANITY_DATASET
ENV SANITY_PROJECT_ID=${SANITY_PROJECT_ID}
ENV SANITY_DATASET=${SANITY_DATASET}

# The dataset is public, but every article was migrated with a dotted _id
# (article.<slug>) and the default public grant is `_id in path("*")`, where *
# matches a single segment — so the guides are NOT anonymously readable and this
# token is load-bearing. It is only needed for that reason.
#
# Safe here because the build stage is discarded: the runtime image below is a
# separate FROM and copies only dist/, so the token is absent from the pushed
# image. It DOES persist in this stage's config, so treat the local layer cache
# as sensitive and do not export build cache to a shared registry. Switch to a
# BuildKit secret mount (--mount=type=secret) if that changes, or widen the
# Sanity grant to path("**") and drop this entirely — which also re-enables the
# CDN, since client.ts sets useCdn: !token.
ARG SANITY_API_READ_TOKEN
ENV SANITY_API_READ_TOKEN=${SANITY_API_READ_TOKEN}

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
# nginx.conf replaces the stock config outright and never includes conf.d, so
# default.conf is dead weight. The ipv6 entrypoint script exists only to patch
# that file, and our server block already declares listen [::]:8080, so both go
# rather than have the entrypoint log about a file it cannot find or write.
RUN rm -f /etc/nginx/conf.d/default.conf \
       /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh \
    && chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
# The user agent is what keeps these probes out of the access log; see the map
# in nginx.conf. Fetches the real homepage, not a stub, so an empty dist/ fails.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null --user-agent=docker-healthcheck http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
