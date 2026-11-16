import Dexie, { type Table } from "dexie";

export type PieceState = "montada" | "desmontada" | "guardada";
export const PIECE_STATES: PieceState[] = ["montada", "desmontada", "guardada"];

export interface Project { id: number; name: string; description: string; photoIds: number[] }
export interface Piece {
  id?: number; code: string; name: string; photoIds: number[]; measures: string;
  orientation: string; notes: string; state: PieceState; boxId: number | null; createdAt: number;
}
export interface Bag {
  id?: number; code: string; content: string; quantity: number; photoIds: number[];
  jointId: number | null; boxId: number | null; createdAt: number;
}
export interface Box { id?: number; code: string; location: string; photoIds: number[]; createdAt: number }
export interface Photo { id?: number; blob: Blob; createdAt: number }
export interface Counter { kind: "P" | "B" | "C"; value: number }

class ArmarioDB extends Dexie {
  project!: Table<Project, number>;
  pieces!: Table<Piece, number>;
  bags!: Table<Bag, number>;
  boxes!: Table<Box, number>;
  photos!: Table<Photo, number>;
  counters!: Table<Counter, string>;
  constructor() {
    super("armario");
    this.version(1).stores({
      project: "id",
      pieces: "++id, code, state, boxId",
      bags: "++id, code, boxId, jointId",
      boxes: "++id, code",
      photos: "++id",
      counters: "kind",
    });
  }
}

export const db = new ArmarioDB();

export function formatCode(kind: "P" | "B" | "C", n: number) {
  return kind === "C" ? `C-${n}` : `${kind}-${String(n).padStart(2, "0")}`;
}

export async function peekCode(kind: "P" | "B" | "C") {
  const c = await db.counters.get(kind);
  return formatCode(kind, (c?.value ?? 0) + 1);
}

export async function nextCode(kind: "P" | "B" | "C") {
  return db.transaction("rw", db.counters, async () => {
    const c = await db.counters.get(kind);
    const value = (c?.value ?? 0) + 1;
    await db.counters.put({ kind, value });
    return formatCode(kind, value);
  });
}

export async function getProject(): Promise<Project> {
  return (await db.project.get(1)) ?? { id: 1, name: "Mi armario", description: "", photoIds: [] };
}

export async function compressImage(file: Blob, max = 1600, quality = 0.7): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("No se pudo comprimir"))), "image/jpeg", quality));
}

export async function savePhoto(file: Blob) {
  const blob = await compressImage(file);
  return db.photos.add({ blob, createdAt: Date.now() });
}

function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(b); });
}

export async function exportBackup() {
  const photos = await db.photos.toArray();
  return {
    app: "armario", version: 1, exportedAt: new Date().toISOString(),
    project: await db.project.toArray(), pieces: await db.pieces.toArray(), bags: await db.bags.toArray(),
    boxes: await db.boxes.toArray(), counters: await db.counters.toArray(),
    photos: await Promise.all(photos.map(async (p) => ({ id: p.id, createdAt: p.createdAt, data: await blobToDataUrl(p.blob) }))),
  };
}

export async function importBackup(data: any) {
  if (data?.app !== "armario") throw new Error("Archivo no válido");
  const photos = await Promise.all((data.photos ?? []).map(async (p: any) => ({ id: p.id, createdAt: p.createdAt, blob: await (await fetch(p.data)).blob() })));
  await db.transaction("rw", [db.project, db.pieces, db.bags, db.boxes, db.photos, db.counters], async () => {
    await Promise.all([db.project.clear(), db.pieces.clear(), db.bags.clear(), db.boxes.clear(), db.photos.clear(), db.counters.clear()]);
    await db.project.bulkAdd(data.project ?? []);
    await db.pieces.bulkAdd(data.pieces ?? []);
    await db.bags.bulkAdd(data.bags ?? []);
    await db.boxes.bulkAdd(data.boxes ?? []);
    await db.counters.bulkAdd(data.counters ?? []);
    await db.photos.bulkAdd(photos);
  });
}
