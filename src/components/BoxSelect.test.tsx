import "fake-indexeddb/auto";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoxSelect } from "./BoxSelect";
import { createBox, db } from "@/lib/db";

function Harness({ onChange }: { onChange: (id: number | null) => void }) {
  const [id, setId] = useState<number | null>(null);
  return <BoxSelect value={id} onChange={(v) => { setId(v); onChange(v); }} />;
}

beforeEach(async () => {
  await db.transaction("rw", [db.boxes, db.counters], async () => {
    await db.boxes.clear();
    await db.counters.clear();
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("selector de caja", () => {
  it("sin cajas no muestra un desplegable de una sola opción", () => {
    render(<BoxSelect value={null} onChange={() => {}} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByRole("button", { name: /crear caja/i })).toBeInTheDocument();
  });

  it("crear caja la añade con código C-1 y la deja seleccionada", async () => {
    vi.stubGlobal("prompt", () => "Trastero");
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /crear caja/i }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const id = onChange.mock.calls[0][0] as number;
    const box = await db.boxes.get(id);
    expect(box?.code).toBe("C-1");
    expect(box?.location).toBe("Trastero");
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveValue(String(id)));
    expect(screen.getByRole("option", { name: /C-1 · Trastero/ })).toBeInTheDocument();
  });

  it("cancelar la ubicación no crea ninguna caja", async () => {
    vi.stubGlobal("prompt", () => null);
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /crear caja/i }));
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(await db.boxes.count()).toBe(0);
  });

  it("los códigos de caja siguen C-1, C-2", async () => {
    expect((await createBox("Trastero")).code).toBe("C-1");
    expect((await createBox("Garaje")).code).toBe("C-2");
  });
});
