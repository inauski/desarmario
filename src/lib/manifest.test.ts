import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("instalación en pantalla de inicio", () => {
  it("declara una app independiente con iconos de 192 y 512 píxeles", () => {
    const manifestUrl = new URL("../../public/manifest.webmanifest", import.meta.url);
    const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    for (const icon of manifest.icons) {
      expect(existsSync(new URL(`../../public${icon.src}`, import.meta.url))).toBe(true);
    }
  });
});
