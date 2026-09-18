"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useAdminAuth } from "./admin-auth-provider";

export function AdminLogin() {
  const { session, checking, signIn } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!checking && session) router.replace("/admin");
  }, [checking, router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await signIn(email.trim(), password);
      router.replace("/admin");
    } catch {
      setError(
        "Não foi possível entrar. Verifique seus dados e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center bg-gray-bg px-5 py-12">
      <Card className="mx-auto w-full max-w-md">
        <p className="text-eyebrow font-bold tracking-[0.14em] text-gold-500 uppercase">
          Atrium Admin
        </p>
        <h1 className="mt-3 font-serif text-h3">Acesso administrativo</h1>
        <p className="mt-3 text-body text-gray-text">
          Entre com a conta autorizada para acompanhar os leads da Atrium.
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="E-mail"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? (
            <p role="alert" className="text-body-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            loading={submitting || checking}
            loadingLabel="Entrando"
          >
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
