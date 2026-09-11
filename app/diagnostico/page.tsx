import type { Metadata } from "next";

import { DiagnosticProvider } from "@/components/diagnostic/diagnostic-provider";
import { DiagnosticShell } from "@/components/diagnostic/diagnostic-shell";

export const metadata: Metadata = {
  title: "Diagnóstico",
  description:
    "Mapeie sinais da sua operação e descubra onde a tecnologia merece ser investigada.",
  alternates: { canonical: "/diagnostico" },
};

export default function DiagnosticPage() {
  return (
    <DiagnosticProvider>
      <DiagnosticShell />
    </DiagnosticProvider>
  );
}
