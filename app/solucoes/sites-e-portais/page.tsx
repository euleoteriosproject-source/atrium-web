import type { Metadata } from "next";

import { SolutionDetailPage } from "@/components/institutional/solution-detail-page";
import { getSolution } from "@/content/solutions";

export const metadata: Metadata = {
  title: "Sites & Experiências Digitais",
  description:
    "Sites e jornadas digitais pensados para apresentar, captar, qualificar e conectar o visitante à operação.",
  alternates: { canonical: "/solucoes/sites-e-portais" },
};

export default function SitesAndPortalsPage() {
  return <SolutionDetailPage solution={getSolution("sites-e-portais")} />;
}
