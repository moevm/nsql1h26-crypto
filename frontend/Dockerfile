# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_MODE=backend
ARG BACKEND_API_ORIGIN=http://backend:8080

ENV NEXT_PUBLIC_API_MODE=${NEXT_PUBLIC_API_MODE}
ENV BACKEND_API_ORIGIN=${BACKEND_API_ORIGIN}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
