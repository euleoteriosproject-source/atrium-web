import type { Metadata } from "next";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ResultShell } from "@/components/results/result-shell";

export const metadata: Metadata = {
  title: "Resultado do diagnóstico",
  description:
    "Veja as oportunidades priorizadas a partir do diagnóstico da sua operação.",
  alternates: { canonical: "/diagnostico/resultado" },
  robots: { index: false, follow: false },
};

export default function DiagnosticResultPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <ResultShell />
      <Footer />
    </div>
  );
}
