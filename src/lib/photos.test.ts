import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { db, PHOTO_JPEG_QUALITY, PHOTO_MAX_EDGE, savePhoto } from "./db";

describe("compresión de fotos al guardar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reduce una foto grande, la convierte a JPEG y guarda esa versión", async () => {
    const bitmap = { width: 3200, height: 1600, close: vi.fn() };
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
    const drawImage = vi.fn();
    const compressed = new Blob(["jpeg-comprimido"], { type: "image/jpeg" });
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toBlob: vi.fn((callback: (blob: Blob) => void, type: string, quality: number) => {
        expect(type).toBe("image/jpeg");
        expect(quality).toBe(PHOTO_JPEG_QUALITY);
        callback(compressed);
      }),
    } as unknown as HTMLCanvasElement;
    vi.spyOn(document, "createElement").mockReturnValue(canvas);
    await db.photos.clear();

    const id = await savePhoto(new Blob(["foto-original-mucho-mas-grande"], { type: "image/png" }));

    expect(canvas.width).toBe(PHOTO_MAX_EDGE);
    expect(canvas.height).toBe(800);
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, PHOTO_MAX_EDGE, 800);
    expect(bitmap.close).toHaveBeenCalledOnce();
    expect((await db.photos.get(id))?.blob).toBe(compressed);
  });
});
