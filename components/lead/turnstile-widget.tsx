"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const scriptId = "atrium-turnstile-script";

export function TurnstileWidget({
  siteKey,
  onTokenChange,
}: {
  siteKey?: string;
  onTokenChange: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;
    let widgetId: string | undefined;

    const renderWidget = () => {
      if (cancelled || widgetId || !containerRef.current || !window.turnstile) {
        return;
      }
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action: "create_lead",
        callback: (token) => {
          setFailed(false);
          onTokenChange(token);
        },
        "expired-callback": () => {
          onTokenChange(null);
          if (widgetId) window.turnstile?.reset(widgetId);
        },
        "error-callback": () => {
          setFailed(true);
          onTokenChange(null);
        },
      });
    };

    const existing = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const failWidget = () => {
      setFailed(true);
      onTokenChange(null);
    };
    if (!existing) {
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", renderWidget);
    script.addEventListener("error", failWidget);
    renderWidget();

    return () => {
      cancelled = true;
      script.removeEventListener("load", renderWidget);
      script.removeEventListener("error", failWidget);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onTokenChange, siteKey]);

  if (!siteKey) {
    return process.env.NODE_ENV === "development" ? (
      <p className="text-body-sm text-gray-text">
        Proteção antiabuso não configurada localmente. O envio seguirá pelo
        fallback de WhatsApp.
      </p>
    ) : null;
  }

  return (
    <div>
      <div ref={containerRef} aria-label="Verificação contra abuso" />
      {failed ? (
        <p role="status" className="mt-2 text-body-sm text-gray-text">
          A verificação não foi concluída. Você ainda poderá continuar pelo
          WhatsApp.
        </p>
      ) : null}
    </div>
  );
}
