import type { Metadata } from "next";
import type { ReactNode } from "react";

import { publicEnv } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Atrium",
    template: "%s | Atrium",
  },
  description: "Tecnologia que transforma operação em resultado.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
