# Pendientes documentados

## Open source / portafolio

Decidido (2026-10-16): Wealet sigue como open source self-hosted orientado a portafolio, no SaaS. Licencia MIT se mantiene. El deploy actual (Vercel/Render/Supabase) queda como instancia para conocidos. Plan en orden:

1. **Script de datos ficticios** (seed): usuario demo con varios meses de fondos, transacciones y categorías realistas. Hoy no existe (solo migraciones). Por definir: comando CLI (`pnpm --filter api seed`) vs opción "cargar datos de ejemplo" en onboarding.
2. **Capturas** con Playwright sobre los datos ficticios; video opcional del producto con el plugin HyperFrames (no instalado: `/plugin install hyperframes@claude-plugins-official`).
3. **README en español** (principal) + `README.en.md` corto.
4. **Self-hosting**: `docker-compose` completo (api + web + db), Dockerfiles, migraciones al arrancar; Google OAuth y Brevo opcionales por env; `ALLOW_REGISTRATION=false` para instancias privadas.
5. **Mínimo de comunidad**: `CONTRIBUTING.md`, `SECURITY.md`, aviso de "mantenido en tiempo libre".
6. **i18n inglés/español** — opcional, a futuro.

Diferido: **demo pública** (Render free tier tiene arranque en frío; no hay presupuesto). Alternativa gratuita a evaluar: demo solo frontend con datos simulados en Vercel.

## Otros

- **Salud — recomendaciones vía IA**: reemplazar la sección estática oculta (`RecommendationCards`, `RECS`) por recomendaciones generadas por LLM a partir del comportamiento financiero real del usuario. Evaluado con Gemini y pospuesto por la política de datos/entrenamiento del free tier — revisar si Wealet pasa a ser un SaaS.
- **Error tracking**: `HttpExceptionFilter` solo loguea a consola. Conectar a Sentry (u otro) si la API se despliega sin monitoreo activo — hoy alcanza porque corre en dev con la terminal a la vista (uso personal + demo de portfolio).
- **Peticiones API redundantes**: `FundDetail.tsx` dispara 2 `GET /transactions` por cambio de mes (uno `limit=500` para los totales, otro paginado para la tabla) — no crítico para uso personal. Queda pendiente auditar el resto de la app buscando el mismo patrón (fetch completo + fetch paginado del mismo recurso) antes de decidir si vale la pena optimizar.
- **Accesibilidad del drawer mobile del shell**: sin cierre por Escape, focus trap, ni `aria-expanded`/`aria-controls` en el botón hamburguesa.
- **`PASSWORD_PEPPER_PREVIOUS`**: retirar de Render una vez confirmado que todos los usuarios activos volvieron a loguear al menos una vez (el login los re-hashea automáticamente al pepper actual).
- **Categorías**: sin auditoría de estandarización completa propia (solo la migración de tabs/toggle a `SegmentedTabs` durante la pasada de Transacciones).
- **Reordenar fondos**: drag-and-drop manual del orden de fondos, diferido — orden actual es `createdAt ASC`.
- **Moneda extranjera — alcance diferido**: hoy solo las *transacciones* se ingresan en moneda extranjera (la base efectiva sigue siendo CLP). Diferido: modo "toda la app en USD" (renderizar patrimonio/dashboard/salud/reportes en otra base por usuario — la columna `base_currency` ya existe para habilitarlo), moneda extranjera en transferencias e import/export, y validación de campo dedicada para el tipo de cambio en el formulario (hoy el input acepta strings con múltiples puntos → `NaN` cae al mensaje genérico "Monto inválido" en lugar de uno específico de tasa).
