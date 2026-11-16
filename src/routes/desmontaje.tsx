import { createFileRoute } from "@tanstack/react-router";
import { StepMode } from "@/components/StepMode";

export const Route = createFileRoute("/desmontaje")({
  head: () => ({
    meta: [
      { title: "Modo desmontaje — Armario" },
      { name: "description", content: "Recorre los pasos, registra piezas y bolsas y marca cada paso como hecho." },
      { property: "og:title", content: "Modo desmontaje — Armario" },
      { property: "og:description", content: "Desmonta paso a paso sin perder piezas ni herrajes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Disassembly,
});

function Disassembly() {
  return <StepMode mode="desmontaje" />;
}
