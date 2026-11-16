import { registerSW } from "virtual:pwa-register";
import { shouldSkipServiceWorker } from "./pwa-guards";

let initialized = false;

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.filter((registration) => {
    const workers = [registration.active, registration.waiting, registration.installing];
    return workers.some((worker) => worker && new URL(worker.scriptURL).pathname === "/sw.js");
  }).map((registration) => registration.unregister()));
}

/** The only app-shell service-worker registrar. Never runs in dev or Lovable previews. */
export function setupPwa() {
  if (initialized || typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  initialized = true;
  const skip = shouldSkipServiceWorker({
    isProduction: import.meta.env.PROD,
    hostname: window.location.hostname,
    isIframe: window.self !== window.top,
    search: window.location.search,
  });
  if (skip) {
    void unregisterAppWorkers();
    return;
  }
  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.error("No se pudo activar el modo sin conexión", error);
    },
  });
}
