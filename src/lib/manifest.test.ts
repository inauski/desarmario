import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("instalación en pantalla de inicio", () => {
  it("declara una app independiente con iconos de 192 y 512 píxeles", () => {
    const publicDir = path.resolve(process.cwd(), "public");
    const manifest = JSON.parse(readFileSync(path.join(publicDir, "manifest.webmanifest"), "utf8"));
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    for (const icon of manifest.icons) {
      expect(existsSync(path.join(publicDir, icon.src))).toBe(true);
    }
  });
});
