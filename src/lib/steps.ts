import { arrayMove } from "@dnd-kit/sortable";
import { db, nextCode, type Step } from "@/lib/db";

export function orderedSteps(steps: Step[]) {
  return [...steps].sort((a, b) => a.order - b.order || (a.id ?? 0) - (b.id ?? 0));
}

export function stepsForMode(steps: Step[], mode: "desmontaje" | "montaje") {
  const ordered = orderedSteps(steps);
  return mode === "montaje" ? ordered.reverse() : ordered;
}

export function moveSteps(steps: Step[], activeId: number, overId: number) {
  const ordered = orderedSteps(steps);
  const from = ordered.findIndex((step) => step.id === activeId);
  const to = ordered.findIndex((step) => step.id === overId);
  if (from < 0 || to < 0) return ordered;
  return arrayMove(ordered, from, to);
}

export async function createStep() {
  const last = await db.steps.orderBy("order").last();
  const order = (last?.order ?? 0) + 1;
  return db.steps.add({
    order,
    title: `Paso ${order}`,
    description: "",
    photoIds: [],
    tools: [],
    pieceIds: [],
    bagIds: [],
    done: false,
    assembled: false,
    createdAt: Date.now(),
  });
}

export async function reorderSteps(stepIds: number[]) {
  await db.transaction("rw", db.steps, async () => {
    await Promise.all(stepIds.map((id, index) => db.steps.update(id, { order: index + 1 })));
  });
}

export async function deleteStep(stepId: number) {
  await db.steps.delete(stepId);
  const remaining = orderedSteps(await db.steps.toArray());
  await reorderSteps(remaining.map((step) => step.id!));
}

interface NewPiece {
  name: string;
  photoIds: number[];
  boxId: number | null;
}

export async function createPieceForStep(stepId: number, input: NewPiece) {
  const code = await nextCode("P");
  return db.transaction("rw", db.pieces, db.steps, async () => {
    const pieceId = await db.pieces.add({
      code,
      name: input.name,
      photoIds: input.photoIds,
      measures: "",
      orientation: "",
      notes: "",
      state: input.boxId ? "guardada" : "desmontada",
      boxId: input.boxId,
      createdAt: Date.now(),
    });
    const step = await db.steps.get(stepId);
    if (step) await db.steps.update(stepId, { pieceIds: [...new Set([...step.pieceIds, pieceId])] });
    return pieceId;
  });
}

interface NewBag {
  content: string;
  quantity: number;
  photoIds: number[];
  boxId: number | null;
}

export async function createBagForStep(stepId: number, input: NewBag) {
  const code = await nextCode("B");
  return db.transaction("rw", db.bags, db.steps, async () => {
    const bagId = await db.bags.add({
      code,
      content: input.content,
      quantity: input.quantity,
      photoIds: input.photoIds,
      jointId: null,
      boxId: input.boxId,
      createdAt: Date.now(),
    });
    const step = await db.steps.get(stepId);
    if (step) await db.steps.update(stepId, { bagIds: [...new Set([...step.bagIds, bagId])] });
    return bagId;
  });
}
