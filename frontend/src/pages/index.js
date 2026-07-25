/**
 * Barril de páginas de la aplicación (auth, dashboard, reportes y configuración).
 */
export * from "./login/login.jsx";
export * from "./forgot/forgot.jsx";
export * from "./reset/reset.jsx";
export * from "./dashboard/dashboard.jsx";
export * from "./notFound/notFound.jsx";
/** Página de reportes. */
export { default as Reports } from "./reports/reportes.jsx";
/** Página de notificaciones. */
export { default as Notifications } from "./notifications/notifications.jsx";
/** Página de permisos de configuración. */
export { default as Permissions } from "./settings/permission/permission.jsx";
/** Página de asignación de perfiles. */
export { default as AssignProfile } from "./settings/assignprofile/assignprofile.jsx";
