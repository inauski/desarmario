import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }));

import { HelpButton, HelpDialog } from "./HelpDialog";

afterEach(() => {
  cleanup();
  navigate.mockClear();
});

const STEPS = [
  "Herramientas",
  "Alta rápida",
  "Uniones",
  "Pasos",
  "Etiquetas",
  "Desmontaje",
  "Montaje",
  "Copia de seguridad",
];

describe("pop-up de instrucciones", () => {
  it("explica los 8 pasos y cómo cerrarlos", () => {
    render(<HelpDialog open onOpenChange={() => {}} />);
    expect(screen.getByText("Cómo funciona Desarmario")).toBeInTheDocument();
    for (const step of STEPS) {
      expect(screen.getByRole("heading", { level: 3, name: step })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /entendido/i })).toBeInTheDocument();
  });

  it("«Entendido» cierra el pop-up", () => {
    const onOpenChange = vi.fn();
    render(<HelpDialog open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /entendido/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("cada paso lleva a su pantalla y cierra el pop-up", () => {
    const onOpenChange = vi.fn();
    render(<HelpDialog open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /abrir herramientas/i }));
    expect(navigate).toHaveBeenCalledWith({ to: "/herramientas" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("el botón de ayuda abre el pop-up", () => {
    render(<HelpButton />);
    expect(screen.queryByText("Cómo funciona Desarmario")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /ver instrucciones de uso/i }));
    expect(screen.getByText("Cómo funciona Desarmario")).toBeInTheDocument();
  });
});
