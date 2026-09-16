import type { Metadata } from "next";

import { ContactShell } from "@/components/lead/contact-shell";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Envie seu diagnóstico e converse com a Atrium sobre o que vale melhorar primeiro.",
  alternates: { canonical: "/contato" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <ContactShell />
      <Footer />
    </div>
  );
}
