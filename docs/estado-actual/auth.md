# Autenticación

- Login/registro con email+contraseña y Google OAuth (`@react-oauth/google` en el front, `POST /auth/google` con `google-auth-library` en el back — el identificador de usuario viene de `tokenInfo.sub`). Usuarios que entraron solo por Google pueden "Establecer contraseña" en vez de "Cambiar contraseña" (`User.hasPassword`).
- Recuperación de contraseña: `POST /auth/forgot-password` / `POST /auth/reset-password`, email vía Brevo. Páginas full-screen `/forgot-password` y `/reset-password?token=` (sin `AppLayout`), `AuthCenteredLayout` compartido entre ambas.
- Rotación de `PASSWORD_PEPPER` sin invalidar usuarios existentes: `PASSWORD_PEPPER_PREVIOUS` opcional; `verifyPasswordWithRehash` verifica con el pepper actual y, si falla, reintenta con el anterior — si verifica, re-hashea con el actual de forma perezosa y transparente. Sin `PASSWORD_PEPPER_PREVIOUS` configurado el comportamiento es idéntico al de un solo pepper.
- Cookie `refresh_token` requiere `NODE_ENV=production` en el hosting para que el navegador la acepte cross-site (frontend en Vercel, API en Render, dominios distintos).
- Responsive: panel de marca (`.auth-brand-panel`) oculto bajo 768px vía media query (no container query — estas pantallas no tienen un ancestro tipo sidebar que angoste el contenido).
- Usa `Button`/`CheckIcon` compartidos; `getUserInitials`/`isValidEmail` centralizados en `auth/utils.ts`.
