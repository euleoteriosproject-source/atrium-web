"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextLink } from "@/components/ui/text-link";
import {
  buildDemonstrationWhatsAppUrl,
  type DemonstrationWhatsAppInput,
} from "@/domain/demonstrations/whatsapp";
import { publicEnv } from "@/lib/env";

export const AUTO_CENTER_DEMONSTRATION = "Auto Center — Atrium Conversão";

type Errors = Partial<Record<"name" | "companyName", string>>;
type DemoInterestFormProps = Readonly<{
  whatsappNumber?: string | null;
}>;

function validate(values: DemonstrationWhatsAppInput): Errors {
  const errors: Errors = {};
  const nameLength = values.name.trim().length;
  const companyLength = values.companyName.trim().length;

  if (nameLength < 2 || nameLength > 80) {
    errors.name = "Informe seu nome com 2 a 80 caracteres.";
  }
  if (companyLength < 2 || companyLength > 120) {
    errors.companyName = "Informe a empresa com 2 a 120 caracteres.";
  }

  return errors;
}

export function DemoInterestForm({
  whatsappNumber = publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER,
}: DemoInterestFormProps = {}) {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = {
      name,
      companyName,
      demonstrationName: AUTO_CENTER_DEMONSTRATION,
    };
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !whatsappNumber) return;

    const url = buildDemonstrationWhatsAppUrl(whatsappNumber, values);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="rounded-control border border-navy-950/12 bg-gray-bg p-5">
        <p className="text-caption font-bold tracking-wide text-gray-text uppercase">
          Demonstração de interesse
        </p>
        <p className="mt-2 text-body font-semibold">
          {AUTO_CENTER_DEMONSTRATION}
        </p>
      </div>

      <Input
        label="Seu nome"
        name="name"
        required
        minLength={2}
        maxLength={80}
        value={name}
        error={errors.name}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        label="Empresa ou negócio"
        name="companyName"
        required
        minLength={2}
        maxLength={120}
        value={companyName}
        error={errors.companyName}
        onChange={(event) => setCompanyName(event.target.value)}
      />

      <p className="text-body-sm text-gray-text">
        Ao continuar, seu nome e o nome da empresa serão incluídos na mensagem
        que será aberta no WhatsApp da Atrium.
      </p>

      {whatsappNumber ? (
        <Button type="submit" size="lg">
          Continuar no WhatsApp <span aria-hidden="true">↗</span>
        </Button>
      ) : (
        <div role="status" className="border-l-2 border-accent-strong pl-5">
          <p className="text-body text-gray-text">
            O WhatsApp não está disponível neste momento. Você ainda pode falar
            com a Atrium pelo contato.
          </p>
          <TextLink href="/contato" className="mt-3 inline-flex">
            Ir para contato <span aria-hidden="true">→</span>
          </TextLink>
        </div>
      )}
    </form>
  );
}
