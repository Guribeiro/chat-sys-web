FROM node:22-slim

# pnpm 9 matches lockfileVersion 9.0 and runs native postinstall scripts (swc, esbuild, tailwind oxide)
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 8080

# 0.0.0.0 instead of "::" so it binds even when Docker has IPv6 disabled
CMD ["pnpm", "vite", "--host", "0.0.0.0", "--port", "8080"]
