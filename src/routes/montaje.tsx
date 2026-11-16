import { createFileRoute } from "@tanstack/react-router";
import { StepMode } from "@/components/StepMode";

export const Route = createFileRoute("/montaje")({
  head: () => ({
    meta: [
      { title: "Modo montaje — Desarmario" },
      { name: "description", content: "Monta en orden inverso con las fotos, piezas, bolsas y cajas de cada paso." },
      { property: "og:title", content: "Modo montaje — Desarmario" },
      { property: "og:description", content: "Vuelve a montar siguiendo los pasos del desmontaje en orden inverso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assembly,
});

function Assembly() {
  return <StepMode mode="montaje" />;
}
