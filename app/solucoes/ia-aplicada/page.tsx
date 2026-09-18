import type { Metadata } from "next";

import { SolutionDetailPage } from "@/components/institutional/solution-detail-page";
import { getSolution } from "@/content/solutions";

export const metadata: Metadata = {
  title: "IA Aplicada",
  description:
    "Inteligência artificial aplicada quando interpretação, linguagem e classificação realmente melhoram o processo.",
  alternates: { canonical: "/solucoes/ia-aplicada" },
};

export default function AppliedAiPage() {
  return <SolutionDetailPage solution={getSolution("ia-aplicada")} />;
}
