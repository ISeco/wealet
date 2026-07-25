# Infraestructura y seguridad

## Deploy y DB

- Frontend en Vercel, API en Render, Postgres en Supabase (migrado desde Render, que borra la DB a los 90 días en su tier gratuito).
- `isRemoteDatabase()` (`config/is-remote-database-url.ts`) activa SSL para cualquier host que no sea `localhost`/`127.0.0.1` — funciona tanto con `DATABASE_URL` como con las variables sueltas (`DB_HOST`/etc.), no está atado a un proveedor específico.
- `apps/web/vercel.json` tiene el rewrite SPA (`/(.*) -> /index.html`) para que las rutas no-raíz no den 404 al refrescar.
- Puerto local de Postgres remapeado a `127.0.0.1:5433:5432` en `docker-compose.yml` (conflicto con una instalación nativa de Postgres en Windows; no expuesto a la LAN).

## Shell

- Sidebar en mobile (<768px) es un drawer (`position: fixed`, desliza con `.sidebar--open`), con backdrop y cierre automático al navegar. `TopBar` agrega botón hamburguesa y colapsa el buscador a icon-only. Touch targets ≥44×44px en mobile.
- Pendiente de accesibilidad: cierre con Escape, focus trap, `aria-expanded`/`aria-controls` en el hamburguesa. Ver `pendientes.md`.

## Seguridad

- Auditoría Cyber Neo (2026-07-13, risk score 23/100) remediada: `helmet`, Swagger gateado a `NODE_ENV !== 'production'`, rate limiting (`@nestjs/throttler` — 100 req/min global, 5 req/min en endpoints de auth), `algorithms: ['HS256']` fijado explícitamente en JWT, logging de intentos de login fallidos y reuso de refresh token, límite de 5MB en upload de Excel, GitHub Actions fijadas a SHA de commit, `.gitignore` con patrones de credenciales, único lockfile trackeado (`pnpm-lock.yaml` raíz).
- `xlsx` (vulnerable, sin fix) reemplazado por `exceljs` en todo el parser de import/export.
- Rotación de credenciales legacy completada en Render (`DB_PASSWORD`, `JWT_SECRET`, `PASSWORD_PEPPER` — ver `auth.md` para el mecanismo de rotación sin invalidar usuarios). `BREVO_API_KEY` también rotada tras quedar expuesta en un log de sesión.
- `HttpExceptionFilter` global: shape de error uniforme `{ statusCode, message, error, timestamp, path }`; loguea a consola el stack trace de excepciones no-HTTP. Sin tracker externo conectado — ver `pendientes.md`.

## Estandarización

- Regla "Standardization pass on a feature" (`docs/conventions.md`) aplicada a todas las features de `apps/web`: Health, Funds, Transactions, Transfers, Settings, Auth, Dashboard, Onboarding, Import-export. Categories solo parcialmente (ver `categorias.md`).
- `app/HomePlaceholder.tsx` (dead code, sin referencias) eliminado.
