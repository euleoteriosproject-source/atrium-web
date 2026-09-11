"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { LinkButton } from "../ui/link-button";
import { primaryNavigation } from "./navigation";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((current) => !current)}
        className="motion-interactive flex size-11 items-center justify-center rounded-control border border-navy-950/15 bg-transparent transition-colors hover:border-navy-950"
      >
        <span aria-hidden="true" className="relative block h-4 w-5">
          <span
            className={cn(
              "motion-interactive absolute top-0 left-0 h-px w-5 bg-current transition-transform",
              open && "translate-y-2 rotate-45",
            )}
          />
          <span
            className={cn(
              "motion-interactive absolute top-2 left-0 h-px w-5 bg-current transition-opacity",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "motion-interactive absolute top-4 left-0 h-px w-5 bg-current transition-transform",
              open && "-translate-y-2 -rotate-45",
            )}
          />
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          className="fixed inset-x-0 top-18 z-[60] border-y border-navy-950/10 bg-offwhite px-5 py-5 shadow-card sm:px-8"
        >
          <nav aria-label="Navegação móvel">
            <ul className="space-y-1">
              {primaryNavigation.map((item, index) => (
                <li key={item.href}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="motion-interactive flex min-h-11 items-center rounded-control px-3 text-body font-semibold transition-colors hover:bg-navy-950/5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <LinkButton
              href="/diagnostico"
              className="mt-4 w-full"
              onClick={() => setOpen(false)}
            >
              Diagnóstico gratuito
            </LinkButton>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
