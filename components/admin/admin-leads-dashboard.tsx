"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  AdminApiError,
  getAdminLeads,
  type AdminLeadQuery,
} from "@/domain/admin/client";
import { formatBrazilPhone } from "@/supabase/functions/_shared/brazil-phone";
import {
  adminLeadStatusLabels,
  adminLeadStatuses,
  adminLeadTimeframeLabels,
  adminLeadTimeframes,
  adminLeadTiers,
  type AdminLeadListResponse,
  type AdminLeadHandoffFilter,
  type AdminLeadStatus,
  type AdminLeadTier,
  type AdminLeadTimeframe,
} from "@/supabase/functions/_shared/admin-lead-types";
import {
  optionLabel,
  primaryGoalOptions,
} from "@/supabase/functions/_shared/lead-editorial-labels";

import { AdminHeader } from "./admin-header";
import { adminApiConfig, useAdminAuth } from "./admin-auth-provider";

const emptyFilters: AdminLeadQuery = {
  page: 1,
  status: "",
  tier: "",
  timeframe: "",
  handoff: "",
  dateFrom: "",
  dateTo: "",
  query: "",
};

function dateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Data indisponível";
  }
}

function StatusBadge({ status }: { status: AdminLeadStatus }) {
  return (
    <span className="inline-flex rounded-full border border-navy-950/10 bg-gray-bg px-3 py-1 text-caption font-bold text-navy-950">
      {adminLeadStatusLabels[status]}
    </span>
  );
}

function HandoffBadge({ opened }: { opened: boolean }) {
  return (
    <span className="inline-flex rounded-full border border-navy-950/10 bg-offwhite px-3 py-1 text-caption font-bold text-navy-950">
      {opened ? "Abriu" : "Não abriu"}
    </span>
  );
}

export function AdminLeadsDashboard() {
  const { session, checking, expire } = useAdminAuth();
  const router = useRouter();
  const [draft, setDraft] = useState<AdminLeadQuery>(emptyFilters);
  const [query, setQuery] = useState<AdminLeadQuery>(emptyFilters);
  const [data, setData] = useState<AdminLeadListResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!checking && !session) router.replace("/admin/login");
  }, [checking, router, session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void getAdminLeads(query, session.accessToken, adminApiConfig)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
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
            : "Não foi possível carregar os leads.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [expire, query, router, session]);

  function submitFilters(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    setQuery({ ...draft, page: 1 });
  }

  function resetFilters() {
    setLoading(true);
    setError(undefined);
    setDraft(emptyFilters);
    setQuery(emptyFilters);
  }

  function changePage(page: number) {
    setLoading(true);
    setError(undefined);
    setQuery((current) => ({ ...current, page }));
  }

  if (checking || (!session && !error)) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-bg">
        <p role="status" className="text-body text-gray-text">
          Verificando acesso…
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      <AdminHeader />
      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-3 border-b border-navy-950/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-eyebrow font-bold tracking-[0.14em] text-gold-500 uppercase">
              Operação comercial
            </p>
            <h1 className="mt-2 font-serif text-h2">Leads</h1>
          </div>
          <p className="max-w-md text-body-sm text-gray-text">
            Consulta segura e somente leitura dos contatos capturados pelo
            diagnóstico.
          </p>
        </div>

        {data ? (
          <section
            aria-label="Resumo"
            className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-7"
          >
            <Card className="p-5 sm:p-5">
              <p className="text-caption font-bold text-gray-text uppercase">
                Total
              </p>
              <p className="mt-2 text-h3 font-bold">{data.summary.total}</p>
            </Card>
            {adminLeadStatuses.map((status) => (
              <Card key={status} className="p-5 sm:p-5">
                <p className="text-caption font-bold text-gray-text uppercase">
                  {adminLeadStatusLabels[status]}
                </p>
                <p className="mt-2 text-h3 font-bold">
                  {data.summary.byStatus[status]}
                </p>
              </Card>
            ))}
          </section>
        ) : null}

        <Card className="mt-8 p-5 sm:p-7">
          <form onSubmit={submitFilters}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-7">
              <div className="xl:col-span-2">
                <Input
                  label="Buscar"
                  placeholder="Código, empresa, nome ou telefone"
                  maxLength={80}
                  value={draft.query}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      query: event.target.value,
                    }))
                  }
                />
              </div>
              <Select
                label="Status"
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status: event.target.value as AdminLeadStatus | "",
                  }))
                }
              >
                <option value="">Todos</option>
                {adminLeadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {adminLeadStatusLabels[status]}
                  </option>
                ))}
              </Select>
              <Select
                label="Tier"
                value={draft.tier}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    tier: event.target.value as AdminLeadTier | "",
                  }))
                }
              >
                <option value="">Todos</option>
                {adminLeadTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    Tier {tier}
                  </option>
                ))}
              </Select>
              <Select
                label="Momento"
                value={draft.timeframe}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    timeframe: event.target.value as AdminLeadTimeframe | "",
                  }))
                }
              >
                <option value="">Todos</option>
                {adminLeadTimeframes.map((timeframe) => (
                  <option key={timeframe} value={timeframe}>
                    {adminLeadTimeframeLabels[timeframe]}
                  </option>
                ))}
              </Select>
              <Select
                label="WhatsApp no cadastro"
                value={draft.handoff}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    handoff: event.target.value as AdminLeadHandoffFilter | "",
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="OPENED">Abriu WhatsApp</option>
                <option value="NOT_OPENED">Não abriu WhatsApp</option>
              </Select>
              <Input
                label="De"
                type="date"
                value={draft.dateFrom}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    dateFrom: event.target.value,
                  }))
                }
              />
              <Input
                label="Até"
                type="date"
                value={draft.dateTo}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    dateTo: event.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit" size="sm">
                Aplicar filtros
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={resetFilters}
              >
                Limpar
              </Button>
            </div>
          </form>
        </Card>

        <section aria-live="polite" className="mt-8">
          {loading ? (
            <Card>
              <p role="status" className="text-gray-text">
                Carregando leads…
              </p>
            </Card>
          ) : error ? (
            <Card>
              <h2 className="text-h4 font-semibold">
                Não foi possível carregar
              </h2>
              <p role="alert" className="mt-2 text-body text-gray-text">
                {error}
              </p>
              <Button
                className="mt-5"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  setError(undefined);
                  setQuery({ ...query });
                }}
              >
                Tentar novamente
              </Button>
            </Card>
          ) : data?.items.length === 0 ? (
            <Card>
              <h2 className="text-h4 font-semibold">Nenhum lead encontrado</h2>
              <p className="mt-2 text-body text-gray-text">
                Ajuste os filtros ou aguarde novos diagnósticos.
              </p>
            </Card>
          ) : data ? (
            <>
              <div className="hidden overflow-x-auto rounded-card border border-navy-950/10 bg-offwhite md:block">
                <table className="w-full border-collapse text-left text-body-sm">
                  <thead className="border-b border-navy-950/10 bg-navy-950 text-offwhite">
                    <tr>
                      {[
                        "Lead",
                        "Contato",
                        "Objetivo",
                        "Status",
                        "WhatsApp",
                        "Tier",
                        "Score",
                        "Momento",
                        "Último contato",
                        "Follow-up",
                        "Recebido",
                      ].map((label) => (
                        <th
                          key={label}
                          scope="col"
                          className="px-4 py-3 font-semibold"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((lead) => (
                      <tr
                        key={lead.publicCode}
                        className="border-b border-navy-950/8 last:border-0"
                      >
                        <td className="px-4 py-4 align-top">
                          <Link
                            href={`/admin/lead?publicCode=${lead.publicCode}`}
                            className="font-bold underline decoration-gold-500 decoration-2 underline-offset-4"
                          >
                            {lead.publicCode}
                          </Link>
                          <span className="mt-1 block text-gray-text">
                            {lead.companyName}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className="font-semibold">
                            {lead.contactName}
                          </span>
                          <span className="block text-gray-text">
                            {formatBrazilPhone(lead.phone) ?? lead.phone}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          {optionLabel(primaryGoalOptions, lead.primaryGoal) ??
                            "Não informado"}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <HandoffBadge
                            opened={Boolean(lead.whatsappHandoffAt)}
                          />
                        </td>
                        <td className="px-4 py-4 align-top font-bold">
                          {lead.leadTier}
                        </td>
                        <td className="px-4 py-4 align-top">
                          {lead.leadScore}/100
                        </td>
                        <td className="px-4 py-4 align-top">
                          {lead.timeframe
                            ? adminLeadTimeframeLabels[lead.timeframe]
                            : "Não informado"}
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          {lead.lastContactAt
                            ? dateTime(lead.lastContactAt)
                            : "—"}
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          {lead.nextFollowUpAt
                            ? dateTime(lead.nextFollowUpAt)
                            : "—"}
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          {dateTime(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-4 md:hidden">
                {data.items.map((lead) => (
                  <Card key={lead.publicCode} className="p-5 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/admin/lead?publicCode=${lead.publicCode}`}
                        className="font-bold underline decoration-gold-500 decoration-2 underline-offset-4"
                      >
                        {lead.publicCode}
                      </Link>
                      <StatusBadge status={lead.status} />
                    </div>
                    <h2 className="mt-4 text-h4 font-semibold">
                      {lead.companyName}
                    </h2>
                    <p className="mt-1 text-body text-gray-text">
                      {lead.contactName} ·{" "}
                      {formatBrazilPhone(lead.phone) ?? lead.phone}
                    </p>
                    <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-navy-950/10 pt-4 text-body-sm">
                      <div>
                        <dt className="text-gray-text">Qualificação</dt>
                        <dd className="font-bold">
                          Tier {lead.leadTier} · {lead.leadScore}/100
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-text">WhatsApp no cadastro</dt>
                        <dd className="font-semibold">
                          {lead.whatsappHandoffAt ? "Abriu" : "Não abriu"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-text">Último contato</dt>
                        <dd className="font-semibold">
                          {lead.lastContactAt
                            ? dateTime(lead.lastContactAt)
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-text">Próximo follow-up</dt>
                        <dd className="font-semibold">
                          {lead.nextFollowUpAt
                            ? dateTime(lead.nextFollowUpAt)
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-text">Objetivo</dt>
                        <dd className="font-semibold">
                          {optionLabel(primaryGoalOptions, lead.primaryGoal) ??
                            "Não informado"}
                        </dd>
                      </div>
                    </dl>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-body-sm text-gray-text">
                  Página {data.pagination.page} de{" "}
                  {Math.max(data.pagination.totalPages, 1)} ·{" "}
                  {data.pagination.total} resultado(s)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={data.pagination.page <= 1}
                    onClick={() => changePage(data.pagination.page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={
                      data.pagination.page >= data.pagination.totalPages
                    }
                    onClick={() => changePage(data.pagination.page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
