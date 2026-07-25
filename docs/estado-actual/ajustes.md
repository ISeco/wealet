# Ajustes

- `/ajustes`: perfil (nombre editable, cambiar contraseña con logout automático), framework por defecto, toggles de runway, tema claro/oscuro, exportar `.xlsx`, importar, reconfigurar fondos.
- Cambiar de framework muestra un `ConfirmDialog` explicando qué se archivará antes de aplicar — mensaje condicional: salir de `fondos` no archiva nada (no tiene fondos-slot), cualquier otro caso sí.
- "Reconfigurar fondos" navega a `/onboarding?from=settings`; en ese modo el botón "Salir" del wizard vuelve a `/ajustes` en vez de desloguear.
- Responsive: grids fluidos (Nombre/Email desde 480px de contenedor; cards Datos/Cuenta con `auto-fit`); filas label+control (`settingsRow`) apilan bajo 380px de contenedor cuando el contenido no se puede encoger (ej. email largo).
- Usa `Button`/`SegmentedTabs` compartidos (toggle Claro/Oscuro); labels de framework centralizados en `health/utils.ts` (antes había una copia local con texto distinto — "Jars of Eker" vs "Jars de Eker").
