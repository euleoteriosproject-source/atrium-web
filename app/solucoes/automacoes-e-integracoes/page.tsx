import type { Metadata } from "next";

import { SolutionDetailPage } from "@/components/institutional/solution-detail-page";
import { getSolution } from "@/content/solutions";

export const metadata: Metadata = {
  title: "Automações & Integrações",
  description:
    "Automações e integrações para reduzir trabalho repetitivo e conectar ferramentas com controle.",
  alternates: { canonical: "/solucoes/automacoes-e-integracoes" },
};

export default function AutomationsAndIntegrationsPage() {
  return (
    <SolutionDetailPage solution={getSolution("automacoes-e-integracoes")} />
  );
}
