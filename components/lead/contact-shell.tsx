"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import {
  buildDiagnosticResult,
  isCompletedDiagnostic,
} from "@/domain/diagnostic/results";
import type { DiagnosticState } from "@/domain/diagnostic/types";
import { createLead } from "@/domain/lead/client";
import { loadAttribution } from "@/domain/lead/attribution";
import {
  budgetRangeLabels,
  budgetRangeValues,
  leadFormSchema,
  leadSubmissionSchema,
  timeframeLabels,
  timeframeValues,
  type BudgetRange,
  type Timeframe,
} from "@/domain/lead/schema";
import {
  getOrCreateLeadSubmissionId,
  saveLeadHandoff,
} from "@/domain/lead/session";
import { publicEnv } from "@/lib/env";
import { loadDiagnosticSession } from "@/lib/session";
import {
  caretPositionForNationalDigits,
  countNationalDigitsBeforeCaret,
  formatBrazilPhone,
} from "@/supabase/functions/_shared/brazil-phone";
import { leadFieldLimits } from "@/supabase/functions/_shared/lead-constraints";

import { TurnstileWidget } from "./turnstile-widget";

type LeadFormValues = {
  contactName: string;
  companyName: string;
  phone: string;
  email: string;
  timeframe: "" | Timeframe;
  budgetRange: "" | BudgetRange;
  consentContact: boolean;
  website: string;
};

type FieldErrors = Partial<Record<keyof LeadFormValues, string>>;
type LoadedDiagnostic = DiagnosticState | null | undefined;

const initialValues: LeadFormValues = {
  contactName: "",
  companyName: "",
  phone: "",
  email: "",
  timeframe: "",
  budgetRange: "",
  consentContact: false,
  website: "",
};

export function ContactShell() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const submissionIdRef = useRef("");
  const [diagnostic, setDiagnostic] = useState<LoadedDiagnostic>(undefined);
  const [values, setValues] = useState<LeadFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadDiagnosticSession();
      const completed = stored && isCompletedDiagnostic(stored) ? stored : null;
      setDiagnostic(completed);
      if (completed) {
        submissionIdRef.current = getOrCreateLeadSubmissionId(
          completed.startedAt,
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (diagnostic !== undefined) headingRef.current?.focus();
  }, [diagnostic]);

  const result = useMemo(
    () => (diagnostic ? buildDiagnosticResult(diagnostic) : undefined),
    [diagnostic],
  );

  const onTurnstileToken = useCallback(
    (token: string | null) => setTurnstileToken(token),
    [],
  );

  if (diagnostic === undefined) {
    return (
      <main className="min-h-[60vh] bg-offwhite">
        <Container className="py-16 sm:py-24">
          <p role="status" className="text-body text-gray-text">
            Preparando o próximo passo…
          </p>
        </Container>
      </main>
    );
  }

  if (!diagnostic || !result) {
    return (
      <main id="conteudo" className="min-h-[65vh] bg-offwhite text-navy-950">
        <Container className="py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <Eyebrow>Antes de conversar</Eyebrow>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-5 text-h1 font-semibold focus-visible:outline-none focus-visible:shadow-none"
            >
              Primeiro, vamos entender sua operação.
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-gray-text">
              Não encontramos um diagnóstico concluído nesta sessão. Complete as
              perguntas para receber valor antes de enviar seus dados.
            </p>
            <LinkButton href="/diagnostico" size="lg" className="mt-9">
              Fazer diagnóstico
            </LinkButton>
          </div>
        </Container>
      </main>
    );
  }

  const update = <Key extends keyof LeadFormValues>(
    key: Key,
    value: LeadFormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const updatePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;
    const caret = event.currentTarget.selectionStart ?? rawValue.length;
    const nationalDigitsBeforeCaret = countNationalDigitsBeforeCaret(
      rawValue,
      caret,
    );
    const formatted = formatBrazilPhone(rawValue);

    if (formatted === undefined) {
      setValues((current) => ({ ...current }));
      return;
    }

    update("phone", formatted);
    const nextCaret = caretPositionForNationalDigits(
      formatted,
      nationalDigitsBeforeCaret,
    );
    window.requestAnimationFrame(() => {
      phoneInputRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const continueToHandoff = (input: {
    companyName: string;
    timeframe: Timeframe | null;
    publicCode: string | null;
    persisted: boolean;
  }) => {
    saveLeadHandoff({
      version: "1.0.0",
      submissionId: submissionIdRef.current,
      companyName: input.companyName,
      timeframe: input.timeframe || null,
      publicCode: input.publicCode,
      persisted: input.persisted,
      createdAt: new Date().toISOString(),
    });
    router.push("/contato/whatsapp");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = leadFormSchema.safeParse(values);
    if (!form.success) {
      const fieldErrors = form.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([key, messages]) => [
            key,
            messages?.[0],
          ]),
        ),
      );
      window.setTimeout(() => {
        formRef.current
          ?.querySelector<HTMLElement>("[aria-invalid='true']")
          ?.focus();
      }, 0);
      return;
    }

    setSubmitting(true);
    const fallback = () =>
      continueToHandoff({
        companyName: form.data.companyName,
        timeframe: form.data.timeframe,
        publicCode: null,
        persisted: false,
      });

    if (!turnstileToken || !publicEnv.NEXT_PUBLIC_SUPABASE_URL) {
      fallback();
      return;
    }

    const payload = leadSubmissionSchema.safeParse({
      submissionId: submissionIdRef.current,
      contact: form.data,
      diagnostic,
      attribution: loadAttribution(),
      turnstileToken,
      website: values.website,
    });
    if (!payload.success) {
      fallback();
      return;
    }

    try {
      const response = await createLead(payload.data, {
        supabaseUrl: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
        publishableKey: publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      });
      continueToHandoff({
        companyName: form.data.companyName,
        timeframe: form.data.timeframe,
        publicCode: response.publicCode,
        persisted: true,
      });
    } catch {
      fallback();
    }
  };

  return (
    <main id="conteudo" className="bg-offwhite text-navy-950">
      <Container className="py-14 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(32rem,1fr)] lg:gap-20 xl:gap-24">
          <div>
            <Eyebrow>Próximo passo</Eyebrow>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-5 text-h1 font-semibold focus-visible:outline-none focus-visible:shadow-none"
            >
              Vamos conversar sobre o que você quer melhorar.
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-gray-text">
              Envie seu diagnóstico para a Atrium. Usaremos estas informações
              somente para conversar sobre a sua análise.
            </p>

            <div className="mt-10 border-t border-navy-950/12 pt-7">
              <p className="text-caption font-bold tracking-wide text-navy-800 uppercase">
                O que levaremos para a conversa
              </p>
              {result.opportunities.length > 0 ? (
                <ol className="mt-5 space-y-3">
                  {result.opportunities.map((opportunity, index) => (
                    <li
                      key={opportunity.dimension}
                      className="flex gap-3 text-body"
                    >
                      <span
                        aria-hidden="true"
                        className="font-serif text-navy-800"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{opportunity.title}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-body text-gray-text">
                  O contexto informado, mesmo sem uma prioridade conclusiva.
                </p>
              )}
              <p className="mt-7 text-body-sm text-gray-text">
                Suas respostas permanecem neste dispositivo até você confirmar o
                envio. Não inclua senhas, documentos pessoais ou informações
                sensíveis.
              </p>
            </div>
          </div>

          <form
            ref={formRef}
            noValidate
            onSubmit={submit}
            className="border border-navy-950/12 bg-white p-6 shadow-card sm:p-9"
          >
            <div className="space-y-6">
              <Input
                label="Seu nome"
                autoComplete="name"
                maxLength={leadFieldLimits.contactName.maximum}
                required
                value={values.contactName}
                error={errors.contactName}
                onChange={(event) => update("contactName", event.target.value)}
              />
              <Input
                label="Empresa ou negócio"
                autoComplete="organization"
                maxLength={leadFieldLimits.companyName.maximum}
                required
                value={values.companyName}
                error={errors.companyName}
                onChange={(event) => update("companyName", event.target.value)}
              />
              <Input
                ref={phoneInputRef}
                label="WhatsApp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={leadFieldLimits.phone.inputMaximum}
                placeholder="+55 (51) 98289-5068"
                description="Digite DDD e número. O +55 e a formatação são aplicados automaticamente."
                required
                value={values.phone}
                error={errors.phone}
                onChange={updatePhone}
              />
              <Input
                label="E-mail"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={leadFieldLimits.email.maximum}
                description="Opcional"
                value={values.email}
                error={errors.email}
                onChange={(event) => update("email", event.target.value)}
              />
              <Select
                label="Quando você gostaria de melhorar isso?"
                description="Opcional"
                value={values.timeframe}
                error={errors.timeframe}
                onChange={(event) =>
                  update(
                    "timeframe",
                    event.target.value as LeadFormValues["timeframe"],
                  )
                }
              >
                <option value="">Selecione se desejar</option>
                {timeframeValues.map((value) => (
                  <option key={value} value={value}>
                    {timeframeLabels[value]}
                  </option>
                ))}
              </Select>
              <Select
                label="Já existe uma faixa de investimento em mente?"
                description="Opcional — esta resposta não bloqueia o contato."
                value={values.budgetRange}
                error={errors.budgetRange}
                onChange={(event) =>
                  update(
                    "budgetRange",
                    event.target.value as LeadFormValues["budgetRange"],
                  )
                }
              >
                <option value="">Selecione se desejar</option>
                {budgetRangeValues.map((value) => (
                  <option key={value} value={value}>
                    {budgetRangeLabels[value]}
                  </option>
                ))}
              </Select>

              <div
                className="absolute -left-[10000px] h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="website">Não preencha este campo</label>
                <input
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  maxLength={leadFieldLimits.honeypot.maximum}
                  value={values.website}
                  onChange={(event) => update("website", event.target.value)}
                />
              </div>

              <div>
                <Checkbox
                  label="Concordo em enviar meu diagnóstico e meus dados de contato para que a Atrium possa falar comigo sobre esta análise."
                  required
                  checked={values.consentContact}
                  error={errors.consentContact}
                  onChange={(event) =>
                    update("consentContact", event.target.checked)
                  }
                />
                <p className="pl-10 text-body-sm text-gray-text">
                  Consulte a{" "}
                  <Link
                    href="/privacidade"
                    className="font-semibold text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>

              <TurnstileWidget
                siteKey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onTokenChange={onTurnstileToken}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={submitting}
                loadingLabel="Enviando diagnóstico"
              >
                Continuar para o WhatsApp
                <span aria-hidden="true">→</span>
              </Button>
              <p aria-live="polite" className="sr-only">
                {submitting ? "Enviando diagnóstico." : ""}
              </p>
            </div>
          </form>
        </div>
      </Container>
    </main>
  );
}
