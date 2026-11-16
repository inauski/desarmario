import { describe, expect, it } from "vitest";
import { shouldSkipServiceWorker } from "./pwa-guards";

const production = { isProduction: true, isIframe: false, search: "" };

describe("seguridad del modo sin conexión", () => {
  it("solo registra el servicio en una web publicada de producción", () => {
    expect(shouldSkipServiceWorker({ ...production, hostname: "armario.example" })).toBe(false);
    expect(shouldSkipServiceWorker({ ...production, isProduction: false, hostname: "armario.example" })).toBe(true);
  });

  it("nunca registra en la vista previa ni dentro de un marco", () => {
    expect(shouldSkipServiceWorker({ ...production, hostname: "id-preview--0d4a9a56-1a5c-43a1-9ed9-ccbca29680ba.lovable.app" })).toBe(true);
    expect(shouldSkipServiceWorker({ ...production, hostname: "armario.example", isIframe: true })).toBe(true);
  });

  it("permite un dominio propio aunque su nombre parezca una vista previa", () => {
    expect(shouldSkipServiceWorker({ ...production, hostname: "preview-v2--armario.example" })).toBe(false);
  });

  it("respeta el interruptor sw=off", () => {
    expect(shouldSkipServiceWorker({ ...production, hostname: "armario.example", search: "?sw=off" })).toBe(true);
  });
});
