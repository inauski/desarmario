import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InstallAppCard } from "./InstallAppCard";

afterEach(() => {
  cleanup();
  window.dispatchEvent(new Event("appinstalled"));
  vi.restoreAllMocks();
});

describe("instalación en Android", () => {
  it("el botón abre directamente el aviso nativo del navegador", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Linux; Android 15) Chrome/140 Mobile");
    const nativePrompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event("beforeinstallprompt");
    Object.assign(event, {
      prompt: nativePrompt,
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    window.dispatchEvent(event);

    render(<InstallAppCard />);
    const button = await screen.findByRole("button", { name: "Instalar en Android" });
    fireEvent.click(button);

    await waitFor(() => expect(nativePrompt).toHaveBeenCalledOnce());
  });
});
