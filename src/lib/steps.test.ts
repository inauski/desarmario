import { describe, expect, it } from "vitest";
import type { Step } from "@/lib/db";
import { moveSteps, orderedSteps, stepsForMode } from "@/lib/steps";

function step(id: number, order: number): Step {
  return {
    id,
    order,
    title: `Paso ${order}`,
    description: "",
    photoIds: [],
    tools: [],
    pieceIds: [],
    bagIds: [],
    done: false,
    assembled: false,
    createdAt: id,
  };
}

describe("orden de pasos", () => {
  it("ordena por el orden guardado aunque lleguen desordenados", () => {
    expect(orderedSteps([step(3, 3), step(1, 1), step(2, 2)]).map((s) => s.id)).toEqual([1, 2, 3]);
  });

  it("mueve el paso arrastrado a su nueva posición", () => {
    expect(moveSteps([step(1, 1), step(2, 2), step(3, 3)], 3, 1).map((s) => s.id)).toEqual([3, 1, 2]);
  });

  it("montaje recorre exactamente los mismos pasos en orden inverso", () => {
    const steps = [step(1, 1), step(2, 2), step(3, 3)];
    expect(stepsForMode(steps, "desmontaje").map((s) => s.id)).toEqual([1, 2, 3]);
    expect(stepsForMode(steps, "montaje").map((s) => s.id)).toEqual([3, 2, 1]);
  });
});
