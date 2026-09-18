"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminApiError,
  getAdminLead,
  runAdminLeadAction,
} from "@/domain/admin/client";
import { formatBrazilPhone } from "@/supabase/functions/_shared/brazil-phone";
import {
  adminLeadStatusLabels,
  adminLeadStatuses,
  type AdminLeadDetail,
  type AdminLeadStatus,
} from "@/supabase/functions/_shared/admin-lead-types";

import { AdminHeader } from "./admin-header";
import { adminApiConfig, useAdminAuth } from "./admin-auth-provider";

function dateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Data indisponível";
  }
}

function DetailList({
  items,
}: {
  items: readonly Readonly<{ label: string; value: string | number | null }>[];
}) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-caption font-bold tracking-wide text-gray-text uppercase">
            {label}
          </dt>
          <dd className="mt-1 text-body font-semibold">
            {value === null || value === "" ? "Não informado" : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminLeadDetailView() {
  const { session, checking, expire } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const publicCode = searchParams.get("publicCode") ?? "";
  const [lead, setLead] = useState<AdminLeadDetail>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<AdminLeadStatus>("NEW");
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string>();

  useEffect(() => {
    if (!checking && !session) router.replace("/admin/login");
  }, [checking, router, session]);

  const loadLead = useCallback(async () => {
    if (!session) return;
    try {
      const result = await getAdminLead(
        publicCode,
        session.accessToken,
        adminApiConfig,
      );
      setLead(result.lead);
      setSelectedStatus(result.lead.status);
      setError(undefined);
    } catch (requestError) {
      if (
        requestError instanceof AdminApiError &&
        requestError.code === "UNAUTHENTICATED"
      ) {
        expire();
        router.replace("/admin/login");
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar este lead.",
      );
    } finally {
      setLoading(false);
    }
  }, [expire, publicCode, router, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadLead(), 0);
    return () => window.clearTimeout(timer);
  }, [loadLead]);

  const runAction = useCallback(
    async (command: Parameters<typeof runAdminLeadAction>[0]) => {
      if (!session) return false;
      setSaving(true);
      setFeedback(undefined);
      try {
        await runAdminLeadAction(command, session.accessToken, adminApiConfig);
        await loadLead();
        setFeedback("Ação registrada com sucesso.");
        return true;
      } catch (requestError) {
        if (
          requestError instanceof AdminApiError &&
          requestError.code === "UNAUTHENTICATED"
        ) {
          expire();
          router.replace("/admin/login");
          return false;
        }
        setFeedback(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível concluir a ação.",
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [expire, loadLead, router, session],
  );

  if (checking || (!session && !error)) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-bg">
        <p role="status" className="text-gray-text">
          Verificando acesso…
        </p>
      </main>
    );
  }

  const phone = lead
    ? (formatBrazilPhone(lead.contact.phone) ?? lead.contact.phone)
    : "";

  return (
    <div className="min-h-screen bg-gray-bg">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
        <Link
          href="/admin"
          className="text-body-sm font-bold underline decoration-gold-500 decoration-2 underline-offset-4"
        >
          ← Voltar para leads
        </Link>
        {loading ? (
          <Card className="mt-8">
            <p role="status" className="text-gray-text">
              Carregando lead…
            </p>
          </Card>
        ) : error ? (
          <Card className="mt-8">
            <h1 className="text-h3 font-semibold">
              Não foi possível exibir o lead
            </h1>
            <p role="alert" className="mt-3 text-body text-gray-text">
              {error}
            </p>
          </Card>
        ) : lead ? (
          <article className="mt-8 space-y-6">
            <header className="border-b border-navy-950/10 pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-eyebrow font-bold tracking-[0.14em] text-gold-500 uppercase">
                  {lead.publicCode}
                </p>
                <span className="rounded-full border border-navy-950/10 bg-offwhite px-3 py-1 text-caption font-bold">
                  {adminLeadStatusLabels[lead.status]}
                </span>
              </div>
              <h1 className="mt-3 font-serif text-h2">
                {lead.contact.company}
              </h1>
              <p className="mt-2 text-body text-gray-text">
                Recebido em {dateTime(lead.createdAt)}
              </p>
            </header>

            <Card>
              <h2 className="text-h4 font-semibold">Status do atendimento</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Select
                  label="Status comercial"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as AdminLeadStatus)
                  }
                >
                  {adminLeadStatuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={lead.status === "NEW" && status === "CONTACTED"}
                    >
                      {adminLeadStatusLabels[status]}
                    </option>
                  ))}
                </Select>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    disabled={saving || selectedStatus === lead.status}
                    onClick={() => {
                      const terminal = ["WON", "LOST"].includes(selectedStatus);
                      if (
                        terminal &&
                        !window.confirm(
                          `Confirmar status ${adminLeadStatusLabels[selectedStatus]}?`,
                        )
                      ) {
                        return;
                      }
                      void runAction({
                        action: "CHANGE_STATUS",
                        publicCode,
                        status: selectedStatus,
                      });
                    }}
                  >
                    Atualizar status
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <DetailList
                  items={[
                    {
                      label: "Último contato",
                      value: lead.lastContactAt
                        ? dateTime(lead.lastContactAt)
                        : "—",
                    },
                    {
                      label: "Próximo follow-up",
                      value: lead.nextFollowUpAt
                        ? dateTime(lead.nextFollowUpAt)
                        : "—",
                    },
                    {
                      label: "WhatsApp no cadastro",
                      value: lead.whatsappHandoffAt ? "Abriu" : "Não abriu",
                    },
                  ]}
                />
              </div>
              <p className="mt-5 text-body-sm text-gray-text">
                Abrir o WhatsApp após o diagnóstico não confirma envio de
                mensagem nem contato efetivo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-navy-950/10 pt-6">
                <Button
                  size="sm"
                  disabled={saving}
                  onClick={() =>
                    void runAction({ action: "RECORD_CONTACT", publicCode })
                  }
                >
                  Registrar contato
                </Button>
                {lead.outreachWhatsAppUrl ? (
                  <a
                    href={lead.outreachWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-control border border-gold-500 bg-gold-500 px-4 text-body-sm font-bold text-navy-950 hover:bg-gold-300"
                  >
                    Abrir WhatsApp
                  </a>
                ) : null}
                {lead.contact.email ? (
                  <a
                    href={`mailto:${lead.contact.email}`}
                    className="inline-flex min-h-11 items-center rounded-control border border-navy-950/25 px-4 text-body-sm font-bold text-navy-950 hover:border-navy-950"
                  >
                    Enviar e-mail
                  </a>
                ) : null}
              </div>
              <div className="mt-7 grid gap-6 border-t border-navy-950/10 pt-6 lg:grid-cols-2">
                <div>
                  <Textarea
                    label="Adicionar observação"
                    value={note}
                    maxLength={2000}
                    rows={4}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <Button
                    className="mt-3"
                    size="sm"
                    disabled={saving || note.trim().length < 2}
                    onClick={() => {
                      void runAction({
                        action: "ADD_NOTE",
                        publicCode,
                        note,
                      }).then((saved) => {
                        if (saved) setNote("");
                      });
                    }}
                  >
                    Salvar observação
                  </Button>
                </div>
                <div>
                  <Input
                    label="Definir follow-up"
                    type="datetime-local"
                    value={followUpAt}
                    onChange={(event) => setFollowUpAt(event.target.value)}
                  />
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      disabled={saving || !followUpAt}
                      onClick={() => {
                        const date = new Date(followUpAt);
                        if (!Number.isNaN(date.getTime())) {
                          void runAction({
                            action: "SET_FOLLOW_UP",
                            publicCode,
                            followUpAt: date.toISOString(),
                          });
                        }
                      }}
                    >
                      Definir follow-up
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={saving || !lead.nextFollowUpAt}
                      onClick={() =>
                        void runAction({
                          action: "CLEAR_FOLLOW_UP",
                          publicCode,
                        })
                      }
                    >
                      Remover follow-up
                    </Button>
                  </div>
                </div>
              </div>
              {feedback ? (
                <p role="status" className="mt-5 text-body-sm text-gray-text">
                  {feedback}
                </p>
              ) : null}
            </Card>

            <Card>
              <h2 className="text-h4 font-semibold">Identificação e contato</h2>
              <div className="mt-6">
                <DetailList
                  items={[
                    { label: "Nome", value: lead.contact.name },
                    { label: "Empresa", value: lead.contact.company },
                    { label: "WhatsApp", value: phone },
                    { label: "E-mail", value: lead.contact.email },
                  ]}
                />
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="text-h4 font-semibold">Perfil e objetivo</h2>
                <div className="mt-6">
                  <DetailList
                    items={[
                      {
                        label: "Segmento",
                        value: lead.profile.businessSegment,
                      },
                      { label: "Equipe", value: lead.profile.companySize },
                      {
                        label: "Objetivo principal",
                        value: lead.profile.primaryGoal,
                      },
                      { label: "Momento", value: lead.profile.timeframe },
                      {
                        label: "Faixa de investimento",
                        value: lead.profile.budgetRange,
                      },
                    ]}
                  />
                </div>
                {lead.profile.additionalGoals.length ? (
                  <div className="mt-6 border-t border-navy-950/10 pt-5">
                    <p className="text-caption font-bold tracking-wide text-gray-text uppercase">
                      Outros objetivos
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-body">
                      {lead.profile.additionalGoals.map((goal) => (
                        <li key={goal}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
              <Card>
                <h2 className="text-h4 font-semibold">Qualificação</h2>
                <div className="mt-6 grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-caption font-bold text-gray-text uppercase">
                      Tier
                    </p>
                    <p className="mt-2 text-h2 font-bold">
                      {lead.qualification.tier}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption font-bold text-gray-text uppercase">
                      Score
                    </p>
                    <p className="mt-2 text-h2 font-bold">
                      {lead.qualification.score}
                      <span className="text-body text-gray-text">/100</span>
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <h2 className="text-h4 font-semibold">Diagnóstico relevante</h2>
              {lead.opportunities.length ? (
                <ol className="mt-6 grid gap-4 md:grid-cols-3">
                  {lead.opportunities.map((opportunity, index) => (
                    <li
                      key={`${opportunity.title}-${index}`}
                      className="border-l-2 border-gold-500 pl-4"
                    >
                      <p className="font-bold">{opportunity.title}</p>
                      <p className="mt-1 text-body-sm text-gray-text">
                        Prioridade{" "}
                        {opportunity.priority.toLocaleLowerCase("pt-BR")}
                      </p>
                      {opportunity.summary ? (
                        <p className="mt-2 text-body-sm">
                          {opportunity.summary}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-5 text-body text-gray-text">
                  Nenhuma oportunidade priorizada.
                </p>
              )}
              {lead.diagnosticHighlights.length ? (
                <div className="mt-7 grid gap-5 border-t border-navy-950/10 pt-6 sm:grid-cols-2">
                  {lead.diagnosticHighlights.map((highlight) => (
                    <div key={highlight.label}>
                      <p className="text-caption font-bold tracking-wide text-gray-text uppercase">
                        {highlight.label}
                      </p>
                      <p className="mt-2 text-body font-semibold">
                        {highlight.values.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>

            <Card>
              <h2 className="text-h4 font-semibold">Histórico</h2>
              {lead.activities?.length ? (
                <ol className="mt-6 space-y-0">
                  {lead.activities.map((activity, index) => (
                    <li
                      key={`${activity.createdAt}-${activity.type}-${index}`}
                      className="border-l border-navy-950/15 pb-6 pl-5 last:pb-0"
                    >
                      <time className="text-caption font-bold text-gray-text">
                        {dateTime(activity.createdAt)}
                      </time>
                      <p className="mt-1 font-semibold">{activity.label}</p>
                      {activity.detail ? (
                        <p className="mt-1 text-body-sm text-gray-text">
                          {activity.detail}
                        </p>
                      ) : null}
                      {activity.note ? (
                        <p className="mt-2 whitespace-pre-wrap text-body-sm">
                          {activity.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-body text-gray-text">
                  Nenhuma atividade registrada.
                </p>
              )}
            </Card>

            {lead.attribution.length ? (
              <Card>
                <h2 className="text-h4 font-semibold">Origem</h2>
                <div className="mt-6">
                  <DetailList items={lead.attribution} />
                </div>
              </Card>
            ) : null}

            <Card>
              <h2 className="text-h4 font-semibold">Consentimento</h2>
              <p className="mt-3 text-body text-gray-text">
                Contato autorizado em {dateTime(lead.consent.at)}.
              </p>
            </Card>
          </article>
        ) : null}
      </main>
    </div>
  );
}
