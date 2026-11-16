import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db, exportBackup, importBackup } from "@/lib/db";
import { needsBackup, THREE_DAYS_MS } from "@/lib/backup";

describe("aviso de copia de seguridad", () => {
  const now = Date.UTC(2026, 10, 16, 12);

  it("no avisa cuando el proyecto está vacío", () => {
    expect(needsBackup(undefined, now, false)).toBe(false);
  });

  it("avisa si hay datos y nunca se ha exportado", () => {
    expect(needsBackup(undefined, now, true)).toBe(true);
  });

  it("avisa solo cuando han pasado más de 3 días", () => {
    expect(needsBackup(now - THREE_DAYS_MS, now, true)).toBe(false);
    expect(needsBackup(now - THREE_DAYS_MS - 1, now, true)).toBe(true);
  });
});

describe("copia JSON completa", () => {
  beforeEach(async () => {
    await Promise.all([db.project.clear(), db.pieces.clear(), db.bags.clear(), db.boxes.clear(), db.joints.clear(), db.steps.clear(), db.tools.clear(), db.photos.clear(), db.counters.clear()]);
  });

  it("exporta y restaura herramientas y fotos", async () => {
    await db.project.put({ id: 1, name: "Armario prueba", description: "", photoIds: [] });
    await db.tools.add({ name: "Llave Allen", size: "Nº 4", prepared: true, createdAt: 1 });
    await db.photos.add({ blob: new Blob(["fake-image"], { type: "image/jpeg" }), createdAt: 1 });

    const data = await exportBackup();
    expect(data.tools).toHaveLength(1);
    expect(data.tools[0]?.name).toBe("Llave Allen");
    expect(data.photos[0]?.data).toMatch(/^data:image\/jpeg;base64,/);

    await db.tools.clear();
    await db.photos.clear();
    await importBackup(data);

    expect((await db.tools.toArray())[0]?.size).toBe("Nº 4");
    expect((await db.tools.toArray())[0]?.prepared).toBe(true);
    expect((await db.photos.toArray())[0]?.blob.size).toBeGreaterThan(0);
  });
});
