import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import { AttributionCapture } from "@/components/lead/attribution-capture";
import { publicEnv } from "@/lib/env";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

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
      <body className={`${manrope.variable} ${sourceSerif.variable}`}>
        <AttributionCapture />
        {children}
      </body>
    </html>
  );
}
