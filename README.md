# Alex APP — B2B SEO (Full-Stack, Monorepo)

A production-ready **B2B SEO** platform built with **TypeScript**, **React 18 + Vite**, **Express**, and **PostgreSQL**. Frontend and backend live in one repo with shared types and database schema.

> ⚠️ **Installing/Deploying?**  
> See **`Instruction.md`** in this repo for the complete step-by-step guide (server setup, HTTPS, Nginx, database, .env, build, PM2, etc.).

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind, shadcn/ui (Radix UI), TanStack Query, React Hook Form + Zod  
- **Backend:** Express (ESM TS), Passport (local), express-session + connect-pg-simple, Helmet, CSRF, rate-limit  
- **Database:** PostgreSQL 16 via Drizzle ORM (schemas in `shared/`)  
- **Build:** Vite (client → `dist/public`) + esbuild (server → `dist/index.js`)  
- **Process Manager:** PM2  
- **Reverse Proxy / TLS:** Nginx + Certbot (Let’s Encrypt)

## Directory Layout

```
client/    # React app
server/    # Express API
shared/    # Drizzle schemas, shared types & utilities
public/    # public assets (uploads, qr-code, icons)
dist/      # production build output after `npm run build`
```

## Scripts

```bash
npm run dev      # dev API (run client dev separately in client/)
npm run build    # build client + server → dist/
npm run start    # run production from dist/
npm run check    # type-check
```

## Requirements (Deployment Target)

- **OS:** Ubuntu 24.04 LTS (fresh VPS)
- **Runtime:** Node.js LTS (via NodeSource)
- **DB:** PostgreSQL 16 (+ contrib)
- **Web:** Nginx
- **TLS:** Certbot (Let’s Encrypt)
- **Process Manager:** PM2
- **Domain:** A record → your VPS IP (e.g., `A @ 1.1.1.1`)

---

## Documentation

- **Full deployment & operations:** See **`Instruction.md`** (includes prerequisites, HTTPS, Nginx config, .env, DB import, build & run, admin login, and hardening notes).
