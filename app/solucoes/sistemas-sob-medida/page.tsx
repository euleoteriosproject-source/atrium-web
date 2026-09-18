import type { Metadata } from "next";

import { SolutionDetailPage } from "@/components/institutional/solution-detail-page";
import { getSolution } from "@/content/solutions";

export const metadata: Metadata = {
  title: "Sistemas sob Medida",
  description:
    "Sistemas, portais e fluxos construídos a partir da operação real e do menor escopo capaz de gerar valor.",
  alternates: { canonical: "/solucoes/sistemas-sob-medida" },
};

export default function CustomSystemsPage() {
  return <SolutionDetailPage solution={getSolution("sistemas-sob-medida")} />;
}
