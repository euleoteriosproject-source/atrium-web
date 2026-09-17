import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  createResendEmailProvider,
  type EmailDeliveryResult,
  type EmailProvider,
} from "@/supabase/functions/_shared/email-provider";
import {
  buildLeadNotificationEmail,
  formatLeadNotificationDate,
  handleLeadNotification,
  parseLeadInsertEvent,
  type LeadNotificationConfig,
} from "@/supabase/functions/_shared/lead-notification";

const config: LeadNotificationConfig = {
  webhookSecret: "webhook-secret-for-tests",
  notificationEmail: "admin@example.com",
  notificationFrom: "Atrium <leads@example.com>",
};

function webhookPayload() {
  return {
    type: "INSERT",
    table: "mvp_leads",
    schema: "public",
    record: {
      id: "internal-id-not-used",
      submission_id: "submission-id-not-used",
      public_code: "AT-26-ABC123",
      created_at: "2026-09-17T00:25:00.000Z",
      contact_name: "Vinicius",
      company_name: "Teste",
      phone: "5551982895068",
      email: "teste@teste.com",
      business_segment: "REAL_ESTATE",
      company_size: "TWENTY_ONE_TO_FIFTY",
      primary_goal: "SALES",
      lead_score: 62,
      lead_tier: "B",
      timeframe: "NOW",
      top_opportunities: [
        { dimension: "sales", level: "HIGH" },
        { dimension: "service", level: "MODERATE" },
        { dimension: "automation", level: "LOW" },
        { dimension: "integration", level: "HIGH" },
      ],
      source: "website",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "campanha-x",
      utm_content: null,
      utm_term: null,
      referrer: "https://google.com/search",
      landing_page: "/diagnostico",
      answers_json: { Q001: "must-not-be-sent" },
      turnstile_token: "must-not-be-sent",
    },
    old_record: null,
  };
}

function notification(record: Record<string, unknown> = {}) {
  const payload = webhookPayload();
  const parsed = parseLeadInsertEvent({
    ...payload,
    record: { ...payload.record, ...record },
  });
  if (!parsed.success) throw new Error(parsed.code);
  return parsed.data;
}

function request(
  payload: unknown = webhookPayload(),
  secret: string | null = config.webhookSecret,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (secret) headers.set("x-atrium-webhook-secret", secret);
  return new Request(
    "https://project.supabase.co/functions/v1/notify-new-lead",
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
  );
}

function provider(
  result: EmailDeliveryResult = {
    success: true,
    status: 200,
    code: null,
  },
) {
  return {
    send: vi.fn<EmailProvider["send"]>().mockResolvedValue(result),
  } satisfies EmailProvider;
}

describe("notify-new-lead", () => {
  it("accepts only POST", async () => {
    const response = await handleLeadNotification(
      new Request("https://project.supabase.co/functions/v1/notify-new-lead", {
        method: "GET",
      }),
      config,
      provider(),
    );
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });

  it("fails safely when private configuration is unavailable", async () => {
    const emailProvider = provider();
    const response = await handleLeadNotification(
      request(),
      undefined,
      emailProvider,
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it("accepts an INSERT from public.mvp_leads and sends only the notification fields", async () => {
    const emailProvider = provider();
    const logger = { info: vi.fn(), error: vi.fn() };

    const response = await handleLeadNotification(
      request(),
      config,
      emailProvider,
      logger,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(emailProvider.send).toHaveBeenCalledOnce();
    const message = emailProvider.send.mock.calls[0]?.[0];
    expect(message?.subject).toBe(
      "[Atrium] Novo lead B — Teste — AT-26-ABC123",
    );
    expect(message?.idempotencyKey).toBe("atrium-lead-AT-26-ABC123");
    expect(message?.text).toContain("Recebido: 16/09/2026 às 21:25");
    expect(message?.text).toContain("Vinicius\nTeste");
    expect(message?.text).toContain("Imobiliário • 21–50 pessoas");
    expect(message?.text).toContain("WhatsApp: +55 (51) 98289-5068");
    expect(message?.text).toContain(
      "Falar no WhatsApp: https://wa.me/5551982895068",
    );
    expect(message?.text).toContain("Atrair mais clientes");
    expect(message?.text).toContain("Agora / o quanto antes");
    expect(message?.text).toContain("Tier B • 62/100");
    expect(message?.text).toContain(
      "1. Estruturar vendas e acompanhamento — Alta",
    );
    expect(message?.text).toContain("2. Melhorar o atendimento — Moderada");
    expect(message?.text).toContain(
      "3. Reduzir trabalho manual com automação — Baixa",
    );
    expect(message?.text).not.toContain("Conectar sistemas e informações");
    expect(message?.text).toContain("Origem: Site Atrium");
    expect(message?.text).toContain("Campanha: campanha-x");
    expect(message?.text).toContain(
      "Este lead está como NOVO.\nFaça o primeiro contato com este lead.",
    );
    expect(message?.html).toContain("https://wa.me/5551982895068");
    expect(message?.html).toContain("mailto:teste%40teste.com");
    expect(message?.html).toContain("Imobiliário • 21–50 pessoas");
    expect(message?.html).toContain("Atrair mais clientes");
    expect(message?.html).toContain("Agora / o quanto antes");
    expect(message?.html).toContain("Tier B");
    expect(message?.html).toContain("62/100");
    expect(message?.html).toContain("Faça o primeiro contato com este lead.");
    expect(`${message?.html}\n${message?.text}`).not.toMatch(/Admin|CRM/i);
    expect(message?.html).toContain("#0B1320");
    expect(message?.html).toContain("#D4AF37");
    expect(message?.html).toContain("#F8F7F3");
    expect(`${message?.html}\n${message?.text}`).not.toMatch(
      /REAL_ESTATE|TWENTY_ONE_TO_FIFTY|\bSALES\b|\bNOW\b|\bHIGH\b|\bMODERATE\b|\bLOW\b/,
    );
    expect(`${message?.html}\n${message?.text}`).not.toContain("answers_json");
    expect(`${message?.html}\n${message?.text}`).not.toContain("submission_id");
    expect(`${message?.html}\n${message?.text}`).not.toContain(
      "must-not-be-sent",
    );
    expect(`${message?.html}\n${message?.text}`).not.toContain(
      "submission-id-not-used",
    );
    expect(logger.info).toHaveBeenCalledWith(
      "[notify-new-lead] notification-result",
      {
        publicCode: "AT-26-ABC123",
        success: true,
        providerStatus: 200,
        technicalCode: null,
      },
    );
  });

  it("uses the subject fallback when the company is empty or unsafe", () => {
    const message = buildLeadNotificationEmail(
      { ...notification(), companyName: "\r\n" },
      config,
    );
    expect(message.subject).toBe("[Atrium] Novo lead B — AT-26-ABC123");
  });

  it("formats dates in pt-BR and America/Sao_Paulo with a safe fallback", () => {
    expect(formatLeadNotificationDate("2026-09-17T00:25:00.000Z")).toBe(
      "16/09/2026 às 21:25",
    );
    expect(formatLeadNotificationDate("invalid-date")).toBe(
      "Data não informada",
    );
    expect(
      buildLeadNotificationEmail(
        notification({ created_at: "invalid-date" }),
        config,
      ).text,
    ).toContain("Recebido: Data não informada");
  });

  it("uses safe human fallbacks for unknown enums", () => {
    const message = buildLeadNotificationEmail(
      notification({
        business_segment: "UNKNOWN_SEGMENT",
        company_size: "UNKNOWN_SIZE",
        primary_goal: "UNKNOWN_GOAL",
        timeframe: "UNKNOWN_TIMEFRAME",
        top_opportunities: [
          { dimension: "unknown_dimension", level: "UNKNOWN_LEVEL" },
        ],
      }),
      config,
    );
    expect(message.text).toContain("Não informado");
    expect(message.text).toContain(
      "1. Oportunidade identificada — Não informada",
    );
    expect(`${message.html}\n${message.text}`).not.toMatch(
      /UNKNOWN_SEGMENT|UNKNOWN_SIZE|UNKNOWN_GOAL|UNKNOWN_TIMEFRAME|unknown_dimension|UNKNOWN_LEVEL/,
    );
  });

  it("humanizes additional real diagnostic enums", () => {
    const message = buildLeadNotificationEmail(
      notification({
        business_segment: "FINANCE",
        company_size: "ONE",
        primary_goal: "AI",
        timeframe: "EXPLORING",
        top_opportunities: [
          { dimension: "digital", level: "HIGH" },
          { dimension: "software", level: "MODERATE" },
          { dimension: "ai", level: "LOW" },
        ],
      }),
      config,
    );
    expect(message.text).toContain("Financeiro / Crédito • 1 pessoa");
    expect(message.text).toContain("Usar inteligência artificial");
    expect(message.text).toContain("Estou explorando");
    expect(message.text).toContain("Fortalecer a presença digital — Alta");
    expect(message.text).toContain("Avaliar um sistema sob medida — Moderada");
    expect(message.text).toContain("Aplicar IA com segurança — Baixa");
  });

  it("escapes lead and attribution content in the HTML email", () => {
    const message = buildLeadNotificationEmail(
      notification({
        contact_name: "<strong>Nome</strong>",
        company_name: "Empresa & Filhos",
        utm_campaign: '<script>alert("x")</script>',
      }),
      config,
    );
    expect(message.html).toContain("&lt;strong&gt;Nome&lt;/strong&gt;");
    expect(message.html).toContain("Empresa &amp; Filhos");
    expect(message.html).toContain(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
    expect(message.html).not.toContain("<script>");
  });

  it("omits the origin block when only a landing page is present", () => {
    const message = buildLeadNotificationEmail(
      notification({
        source: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        referrer: null,
        landing_page: "/",
      }),
      config,
    );
    expect(message.text).not.toContain("\nORIGEM\n");
    expect(message.html).not.toContain(">Origem<");
    expect(`${message.html}\n${message.text}`).not.toContain("Não informado\n");
  });

  it("does not treat an internal Atrium referrer as commercial origin", () => {
    const message = buildLeadNotificationEmail(
      notification({
        source: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        referrer: "https://atrium.example/diagnostico",
        landing_page: "/",
      }),
      config,
    );
    expect(message.text).not.toContain("\nORIGEM\n");
    expect(message.html).not.toContain(">Origem<");
    expect(`${message.html}\n${message.text}`).not.toContain("atrium.example");
  });

  it("includes the landing page only beside another useful origin", () => {
    const message = buildLeadNotificationEmail(
      notification({
        source: null,
        utm_source: "google",
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        referrer: null,
        landing_page: "/diagnostico",
      }),
      config,
    );
    expect(message.text).toContain("\nORIGEM\n");
    expect(message.text).toContain("UTM source: Google");
    expect(message.text).toContain("Página de entrada: /diagnostico");
    expect(message.html).toContain(">Origem<");
  });

  it("treats a relevant external referrer as useful origin", () => {
    const message = buildLeadNotificationEmail(
      notification({
        source: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        referrer: "https://google.com/search",
        landing_page: "/diagnostico",
      }),
      config,
    );
    expect(message.text).toContain("Referência: https://google.com/search");
    expect(message.text).toContain("Página de entrada: /diagnostico");
  });

  it.each([
    ["table", { table: "other_table" }],
    ["schema", { schema: "private" }],
    ["event", { type: "UPDATE", old_record: {} }],
  ])("rejects the wrong %s", async (_case, override) => {
    const payload = { ...webhookPayload(), ...override };
    const emailProvider = provider();
    const response = await handleLeadNotification(
      request(payload),
      config,
      emailProvider,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      code: "EVENT_NOT_ALLOWED",
    });
    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", null],
    ["invalid", "wrong-secret"],
  ])("rejects a %s webhook secret", async (_case, secret) => {
    const emailProvider = provider();
    const response = await handleLeadNotification(
      request(webhookPayload(), secret),
      config,
      emailProvider,
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      success: false,
      code: "UNAUTHORIZED",
    });
    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload", async () => {
    expect(parseLeadInsertEvent({})).toEqual({
      success: false,
      code: "EVENT_NOT_ALLOWED",
    });
    const emailProvider = provider();
    const response = await handleLeadNotification(
      request({
        ...webhookPayload(),
        record: { public_code: "invalid" },
      }),
      config,
      emailProvider,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      code: "INVALID_PAYLOAD",
    });
    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it("returns a provider error without modifying the webhook record", async () => {
    const payload = webhookPayload();
    const original = structuredClone(payload);
    const emailProvider = provider({
      success: false,
      status: 429,
      code: "rate_limit_exceeded",
    });
    const logger = { info: vi.fn(), error: vi.fn() };

    const response = await handleLeadNotification(
      request(payload),
      config,
      emailProvider,
      logger,
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      success: false,
      code: "NOTIFICATION_FAILED",
    });
    expect(payload).toEqual(original);
    expect(logger.error).toHaveBeenCalledWith(
      "[notify-new-lead] notification-result",
      {
        publicCode: "AT-26-ABC123",
        success: false,
        providerStatus: 429,
        technicalCode: "rate_limit_exceeded",
      },
    );
  });

  it("never includes sensitive lead data in logs", async () => {
    const emailProvider = provider({
      success: false,
      status: 500,
      code: "internal_error",
    });
    const logger = { info: vi.fn(), error: vi.fn() };
    await handleLeadNotification(request(), config, emailProvider, logger);

    const logs = JSON.stringify([
      ...logger.info.mock.calls,
      ...logger.error.mock.calls,
    ]);
    expect(logs).toContain("AT-26-ABC123");
    expect(logs).not.toContain("Vinicius");
    expect(logs).not.toContain("teste@teste.com");
    expect(logs).not.toContain("5551982895068");
    expect(logs).not.toContain(config.webhookSecret);
  });

  it("uses the Resend HTTP adapter for provider success", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: "email-id" }, { status: 200 }));
    const emailProvider = createResendEmailProvider("provider-secret", fetcher);
    const result = await emailProvider.send({
      from: config.notificationFrom,
      to: config.notificationEmail,
      subject: "Subject",
      html: "<p>HTML body</p>",
      text: "Body",
      idempotencyKey: "atrium-lead-AT-26-ABC123",
    });

    expect(result).toEqual({ success: true, status: 200, code: null });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" }),
    );
    const init = fetcher.mock.calls[0]?.[1];
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer provider-secret",
    );
    expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(
      "atrium-lead-AT-26-ABC123",
    );
    expect(JSON.parse(String(init?.body))).toMatchObject({
      subject: "Subject",
      html: "<p>HTML body</p>",
      text: "Body",
    });
  });

  it("sanitizes provider errors and has no database mutation path", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json(
          { name: "validation_error", message: "sensitive provider detail" },
          { status: 422 },
        ),
      );
    const emailProvider = createResendEmailProvider("provider-secret", fetcher);
    await expect(
      emailProvider.send({
        from: config.notificationFrom,
        to: config.notificationEmail,
        subject: "Subject",
        html: "<p>HTML body</p>",
        text: "Body",
        idempotencyKey: "notification-id",
      }),
    ).resolves.toEqual({
      success: false,
      status: 422,
      code: "validation_error",
    });

    const sources = [
      "supabase/functions/notify-new-lead/index.ts",
      "supabase/functions/_shared/lead-notification.ts",
    ]
      .map((file) => readFileSync(resolve(process.cwd(), file), "utf8"))
      .join("\n");
    expect(sources).not.toContain("lead-repository");
    expect(sources).not.toContain("/rest/v1/");
    expect(sources).not.toMatch(/method:\s*["'](?:PATCH|PUT|DELETE)["']/);
  });
});
