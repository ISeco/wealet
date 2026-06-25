# Referencia de diseño — por pantalla

Cada `.html` es **una sola pantalla** extraída del prototipo de Claude Design (`Wealet.dc.html`), aislada para poder trabajarla en Claude Code **sin cargar la app completa** en contexto.

## Cómo usarlo con Claude Code

Cuando trabajes una pantalla, referenciá **solo su archivo** + su feature + sus endpoints. Ejemplo para el login:

> "Implementa la pantalla de login en `apps/web/src/features/auth/`. Diseño de referencia: `docs/design/screens/auth.html`. Endpoints: `POST /auth/login`, `/auth/register`, `/auth/refresh`. No toques otras features."

No abras `Wealet.dc.html` completo (162 KB, toda la app) — contamina el contexto.

## Pantallas

| Archivo | Pantalla | Feature (`apps/web/src/features/`) |
|---|---|---|
| `_app-shell.html` | **Layout compartido** (sidebar + topbar) | `app/` (AppLayout) |
| `auth.html` | Login + registro | `auth/` |
| `onboarding.html` | Onboarding (preset / importar Excel) | `onboarding/` |
| `dashboard.html` | Dashboard | `dashboard/` |
| `fondos.html` | Fondos (lista + detalle) | `funds/` |
| `transacciones.html` | Transacciones (tabs, filtros) | `transactions/` |
| `transferencias.html` | Transferencias entre fondos | `transfers/` |
| `salud.html` | Salud financiera (3 frameworks) | `health/` |
| `categorias.html` | Categorías (tabs Todas/Mías/Sistema, tarjetas con badge Sistema o íconos editar/eliminar) | `categories/` |
| `import.html` | Importar Excel (3 pasos) | `import-export/` |
| `settings.html` | Ajustes / perfil | `settings/` |
| `design-system.html` | Design System (tokens, paleta) | `components/ui/` + `lib/theme` |
| `drawer-txform.html` | Drawer lateral de alta de transacción | `transactions/` |
| `drawer-fundform.html` | Drawer "Nuevo fondo" (nombre, clasificación, color, runway) | `funds/` |
| `drawer-catform.html` | Drawer compartido Nueva/Editar categoría (nombre, tipo, color, preview) | `categories/` |
| `confirm-catdelete.html` | Modal centrado de confirmación al eliminar categoría | `categories/` |
| `palette-quick.html` | Paleta rápida ⌘K | `app/` (global) |

## Layout compartido (importante)

Las pantallas in-app (dashboard, fondos, transacciones, transferencias, salud, categorias, import, settings, design-system) son **solo contenido**: se renderizan **dentro** del `_app-shell.html` (sidebar de 252px + topbar con breadcrumb, título, buscador ⌘K y toggle de tema). Los archivos por pantalla **no repiten** el shell — solo traen lo que va en el área de contenido.

En React esto es un `AppLayout` = `<Sidebar/>` + `<TopBar/>` + `<Outlet/>`, y cada pantalla es una página que entra por el `<Outlet/>`. Constrúyelo una vez en `app/` y reúsalo.

`auth.html` y `onboarding.html` son **full-screen** — no usan el shell.

## Notas
- Sintaxis del prototipo: `{{ x }}` = interpolación, `<sc-if>` / `<sc-for>` = condicional / loop. Es **referencia visual y de estructura**, no código a copiar tal cual — se traduce a React limpio.
- Los tokens (colores, dark mode, tipografía Geist) viven en el `<style>` al inicio de cada archivo. La fuente canónica es `design-system.html` y `docs/conventions.md`.
- Mapeo pantalla → endpoints en `docs/modules.md`.
