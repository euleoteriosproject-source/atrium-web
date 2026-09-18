"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useAdminAuth } from "./admin-auth-provider";

export function AdminHeader() {
  const { signOut } = useAdminAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  return (
    <header className="border-b border-offwhite/10 bg-navy-950 text-offwhite">
      <div className="mx-auto flex min-h-18 w-full max-w-content items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <div className="flex items-baseline gap-3">
          <Link href="/admin" className="text-h4 font-bold tracking-tight">
            Atrium
          </Link>
          <span className="text-caption font-bold tracking-[0.14em] text-gold-300 uppercase">
            Admin
          </span>
        </div>
        <nav aria-label="Administração" className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-control px-3 py-2 text-body-sm font-semibold hover:bg-offwhite/10"
          >
            Leads
          </Link>
          <Button
            variant="outlineDark"
            size="sm"
            onClick={() => void handleSignOut()}
          >
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
