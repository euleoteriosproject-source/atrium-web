import type { Metadata } from "next";

import { WhatsAppHandoff } from "@/components/lead/whatsapp-handoff";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Continuar no WhatsApp",
  description: "Continue a conversa com a Atrium pelo WhatsApp.",
  alternates: { canonical: "/contato/whatsapp" },
  robots: { index: false, follow: false },
};

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <WhatsAppHandoff />
      <Footer />
    </div>
  );
}
