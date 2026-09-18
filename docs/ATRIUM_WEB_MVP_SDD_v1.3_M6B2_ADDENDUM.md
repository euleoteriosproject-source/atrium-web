# ATRIUM WEB MVP — SDD v1.3 Addendum

**Document type:** Normative addendum to the current `ATRIUM_WEB_MVP_SDD_UPDATED.md` (v1.2)  
**Version:** 1.3  
**Date:** 2026-09-16  
**Status:** Approved product/architecture update for M6B.2 planning  
**Primary implementation target:** Codex in VSCode  

> This addendum exists because the exact current v1.2 file lives in the local project and is not available here as a byte-for-byte source. It is intentionally additive so it can be merged into the project SDD without overwriting decisions already consolidated in v1.2. For the sections covered here, this addendum supersedes earlier wording.

---

## 0. Purpose of this update

This update formalizes the operational lead-management model validated after M6B.1 and defines M6B.2.

The product must now distinguish three separate concepts:

1. **commercial stage** — where the lead is in the Atrium sales process;
2. **customer WhatsApp handoff** — whether the visitor opened WhatsApp from the post-diagnostic flow;
3. **human follow-up activity** — what the Atrium administrator actually did after capture.

These concepts MUST NOT be collapsed into a single `status` field.

The core rule is:

> **Opening WhatsApp does not mean CONTACTED.**
>
> A visitor clicking “Abrir WhatsApp” only proves that the handoff was initiated. It does not prove that a message was sent or that a conversation happened.

---

# 1. Current baseline

The following capabilities are considered part of the current baseline and must be preserved:

- M0–M5 completed;
- M5.1 contact input hardening completed;
- `public.mvp_leads` is the official lead table;
- Brazil-first phone normalization and mask;
- Turnstile validation;
- idempotent lead capture;
- WhatsApp fallback when persistence fails;
- M6A asynchronous lead notification through Database Webhook → `notify-new-lead` → Resend;
- humanized notification e-mail;
- M6B.1 Admin Lite read-only interface;
- Supabase Auth admin authentication;
- server-side admin authorization by validated Auth user UUID in `ADMIN_USER_IDS`;
- read-only `admin-leads` Edge Function;
- no direct browser access to `public.mvp_leads`;
- static export compatibility.

M6B.2 MUST extend this baseline without weakening any existing security boundary.

---

# 2. Commercial status model

`public.mvp_leads.status` remains the single source of truth for the **current commercial stage**.

Allowed statuses remain:

```text
NEW
CONTACTED
QUALIFIED
PROPOSAL
WON
LOST
```

## 2.1 Status semantics

### NEW

Lead captured successfully, but Atrium has not yet explicitly recorded a human contact action.

A lead may still be `NEW` even when the visitor opened WhatsApp after the diagnostic.

### CONTACTED

Atrium explicitly recorded that a human follow-up/contact was made.

This state MUST NOT be set merely because:

- the visitor clicked “Abrir WhatsApp”;
- the admin clicked a WhatsApp link;
- an e-mail notification was delivered.

### QUALIFIED

Human interaction confirmed that the opportunity is commercially relevant enough to continue.

### PROPOSAL

A commercial proposal was sent/presented.

### WON

The opportunity converted into a client/project.

### LOST

The opportunity was closed without conversion.

## 2.2 Status corrections

The Admin Lite may allow an authorized administrator to correct a status when necessary.

The system should not enforce an overly rigid one-direction-only state machine in V1 because human sales work may require correction.

Every real status change MUST be auditable in the activity history.

---

# 3. Lead operational fields

M6B.2 may add the following summary fields to `public.mvp_leads` through a **new additive migration**:

```text
status_updated_at       timestamptz
whatsapp_handoff_at     timestamptz null
last_contact_at         timestamptz null
next_follow_up_at       timestamptz null
```

## 3.1 `status_updated_at`

Represents when the current commercial status was last changed.

For existing records, any backfill must be explicit and semantically justified. If all existing records are test/pre-launch records, migration strategy may use `created_at` as the initial baseline after audit.

## 3.2 `whatsapp_handoff_at`

Represents the first recorded time the visitor clicked the public post-diagnostic “Abrir WhatsApp” action.

Rules:

- nullable;
- first successful handoff timestamp only;
- repeated clicks MUST NOT continually overwrite the first timestamp;
- MUST NOT change commercial `status`;
- MUST NOT set `last_contact_at`;
- MUST NOT claim that a message was sent.

Preferred idempotent behavior:

```sql
whatsapp_handoff_at = coalesce(whatsapp_handoff_at, now())
```

## 3.3 `last_contact_at`

Represents the latest human contact explicitly recorded by the Atrium administrator.

It must only change through an authenticated/admin-authorized operational action.

It MUST NOT be inferred from a WhatsApp URL click.

## 3.4 `next_follow_up_at`

Optional future date/time for the next human follow-up.

This supports operational prioritization without turning Admin Lite into a generic CRM.

---

# 4. Lead activity history

M6B.2 introduces one internal operational history table:

```text
public.mvp_lead_activities
```

This table exists only to provide an immutable/auditable timeline of meaningful lead operations.

It is NOT a generic CRM event platform.

## 4.1 Minimum conceptual schema

```text
id                uuid primary key
lead_id           uuid not null -> public.mvp_leads(id)
activity_type     text not null
occurred_at       timestamptz not null
actor_user_id     uuid null
from_status       text null
to_status         text null
channel           text null
note              text null
follow_up_at      timestamptz null
metadata          jsonb null
created_at        timestamptz not null
```

Exact names may be adjusted to project conventions, but semantic behavior must remain.

## 4.2 Initial activity types

Minimum supported activity types:

```text
WHATSAPP_HANDOFF_OPENED
STATUS_CHANGED
CONTACT_RECORDED
NOTE_ADDED
FOLLOW_UP_SCHEDULED
FOLLOW_UP_CLEARED
```

Lead creation may be rendered from `mvp_leads.created_at` without requiring a duplicated `LEAD_CREATED` activity row.

## 4.3 Activity immutability

Activities are append-only in V1.

The Admin UI MUST NOT expose arbitrary update/delete of existing activity records.

Corrections should be represented by a new activity when necessary.

## 4.4 Notes

Notes belong in the activity history instead of one mutable large `notes` field on `mvp_leads`.

Requirements:

- plain text only;
- explicit maximum length;
- no HTML;
- no secrets;
- no sensitive documents;
- no uncontrolled file attachments in V1.

---

# 5. Database security for M6B.2

Both `public.mvp_leads` and `public.mvp_lead_activities` remain inaccessible directly from the public browser.

Required model:

```text
anon             -> no CRUD
regular authenticated user -> no direct CRUD
authorized admin Edge Functions -> backend credential -> allowed operations
```

For the new activities table:

- enable RLS;
- FORCE RLS where consistent with current project policy;
- revoke privileges from `anon` and `authenticated`;
- allow only the server-side backend role required by Edge Functions;
- no public policies.

No service role / secret key may enter the frontend bundle.

All schema changes MUST use a new additive migration. Existing applied migrations MUST NOT be rewritten.

---

# 6. Public WhatsApp handoff tracking

## 6.1 Goal

Distinguish leads that initiated the public WhatsApp handoff immediately after registration from leads that did not.

This enables Admin Lite to avoid treating both cases as identical.

## 6.2 New public Edge Function

Preferred dedicated function:

```text
track-lead-handoff
```

It MUST be separate from `create-lead` and separate from admin mutation functions.

Responsibilities:

1. accept only the expected public handoff request;
2. validate origin/CORS using the current exact-origin model;
3. validate identifiers strictly;
4. identify the existing persisted lead;
5. idempotently set `whatsapp_handoff_at` only when not already set;
6. append `WHATSAPP_HANDOFF_OPENED` activity once;
7. return a minimal response;
8. never return lead details or PII.

## 6.3 Lead identification

Do not use phone or e-mail as identifiers.

Preferred request uses the existing browser-held random submission identifier plus the public code, for example conceptually:

```json
{
  "submissionId": "uuid",
  "publicCode": "AT-26-XXXXXX"
}
```

The request body MUST NOT be logged.

The server MUST confirm the identifiers match the same lead before updating anything.

## 6.4 Public click behavior

On `/contato/whatsapp`, clicking “Abrir WhatsApp” must:

1. build/open the customer-to-Atrium WhatsApp URL immediately;
2. start the handoff tracking request without making navigation depend on it;
3. use a browser-safe fire-and-forget/keepalive approach where appropriate;
4. never delay or prevent WhatsApp because tracking failed.

Critical degradation rule:

```text
tracking failure  -> WhatsApp still opens
```

The public conversion path is more important than analytics/operational tracking.

## 6.5 Handoff semantics in Admin

Admin labels must be precise:

```text
Abriu WhatsApp após o diagnóstico
Não abriu WhatsApp após o diagnóstico
```

or equally clear wording.

Never write:

```text
Cliente entrou em contato
Mensagem enviada
Conversa iniciada
```

based only on the click event.

Admin UI should include a short clarification where useful:

> A abertura do WhatsApp não confirma que a mensagem foi enviada.

---

# 7. Admin Lite — handoff visibility

M6B.2 extends the M6B.1 lead list and detail pages.

## 7.1 Lead list

Add a compact handoff indicator per lead:

```text
WhatsApp aberto
Sem handoff
```

Labels may be refined editorially but must preserve the semantics above.

Add filter:

```text
WhatsApp após diagnóstico:
- Todos
- Abriu
- Não abriu
```

Do not replace the commercial status badge with the handoff badge. Both concepts must remain visible separately.

Example:

```text
AT-26-XXXXXX
Status: Novo
WhatsApp: Abriu
```

## 7.2 Lead detail

Add an operational block:

```text
Handoff do cliente
Abriu WhatsApp após o diagnóstico em 16/09/2026 às 22:21
```

or:

```text
Handoff do cliente
Não abriu WhatsApp após o diagnóstico
```

Again, do not infer sent message/conversation.

---

# 8. M6B.2 — Admin mutation architecture

M6B.1 remains read-only.

M6B.2 should isolate mutations in a dedicated Edge Function rather than casually turning the read-only endpoint into a broad CRUD API.

Preferred function:

```text
admin-lead-actions
```

## 8.1 Security flow

```text
Admin browser
  -> Supabase Auth JWT
  -> admin-lead-actions
  -> validate JWT server-side
  -> extract validated user.id
  -> check ADMIN_USER_IDS
  -> validate typed action/payload
  -> backend-only database mutation
```

Rules:

- authentication is not authorization;
- user UUID must come from validated identity;
- e-mail must not be used as the authorization key;
- no mutation for non-admin authenticated users;
- exact CORS allowlist;
- no wildcard origins in production;
- no backend credential in browser;
- no arbitrary table/column names accepted from client input.

## 8.2 Typed admin actions

Initial allowed actions:

```text
CHANGE_STATUS
RECORD_CONTACT
ADD_NOTE
SET_FOLLOW_UP
CLEAR_FOLLOW_UP
```

Do not expose generic CRUD endpoints.

## 8.3 Atomicity

Whenever one admin action modifies `mvp_leads` and also creates an activity row, those changes should be atomic.

Preferred approaches:

- a small PostgreSQL function/RPC callable only by the backend role; or
- another explicit transaction-capable server-side mechanism.

Do not accept a design where status changes permanently but its required audit activity silently fails.

Avoid `SECURITY DEFINER` unless it is truly necessary and reviewed. Prefer least privilege and explicit grants.

---

# 9. Admin action: change status

Admin detail must expose an explicit commercial status control.

Example UI:

```text
Status do atendimento
[Novo v]
```

Allowed values:

```text
Novo
Contatado
Qualificado
Proposta
Ganho
Perdido
```

On change:

- update `mvp_leads.status`;
- update `status_updated_at`;
- append `STATUS_CHANGED` with `from_status`, `to_status`, admin user UUID and timestamp;
- reject no-op/invalid enum values server-side;
- use confirmation for consequential terminal states when UX warrants it.

The server is authoritative. Frontend restrictions alone are insufficient.

---

# 10. Admin action: record contact

The Admin must have an explicit action:

```text
Registrar contato
```

This is the action that represents real human follow-up.

Minimum fields:

```text
channel   WhatsApp | E-mail | Telefone | Outro
occurred_at (default now, adjustable when appropriate)
note optional
```

Behavior:

- update `last_contact_at`;
- append `CONTACT_RECORDED`;
- if current status is `NEW`, the system MAY automatically transition it to `CONTACTED` because the administrator explicitly recorded real contact;
- if status is already later than CONTACTED, preserve the later status;
- any automatic NEW → CONTACTED transition must be included in the same atomic operation and audit history.

Merely clicking the admin's “Falar no WhatsApp” link MUST NOT perform this action automatically.

---

# 11. Admin action: notes

Add an explicit:

```text
Adicionar observação
```

Behavior:

- append `NOTE_ADDED` activity;
- do not overwrite prior notes;
- enforce server-side length limits;
- preserve line breaks safely;
- no HTML injection;
- no file uploads in V1.

---

# 12. Admin action: follow-up

Admin detail should support:

```text
Próximo acompanhamento
[date/time]
```

Actions:

```text
Agendar follow-up
Limpar follow-up
```

Behavior:

- update `next_follow_up_at`;
- append `FOLLOW_UP_SCHEDULED` or `FOLLOW_UP_CLEARED`;
- never automatically change commercial status merely because a follow-up was scheduled.

Admin list should make overdue/due follow-ups visually detectable without introducing a complex CRM dashboard.

A minimal filter is acceptable:

```text
Follow-up:
- Todos
- Atrasado
- Hoje
- Próximos
```

if it can be implemented without unnecessary complexity.

---

# 13. Activity timeline UI

Lead detail should include an operational timeline ordered newest-first or oldest-first consistently.

Conceptual example:

```text
16/09 22:20  Lead criado
16/09 22:21  Visitante abriu WhatsApp após diagnóstico
17/09 09:13  Status: Novo -> Contatado
17/09 09:13  Contato registrado via WhatsApp
17/09 09:15  Observação adicionada
18/09 14:00  Follow-up agendado
```

The timeline must use human labels and must not display internal JSON or raw enums when a human label exists.

Lead creation may be rendered from `mvp_leads.created_at` even if no `LEAD_CREATED` row exists.

---

# 14. Admin-to-client WhatsApp outreach

## 14.1 Separate direction from public handoff

There are now two different WhatsApp message directions:

```text
Customer -> Atrium
```

Existing public diagnostic handoff.

and:

```text
Atrium -> Customer
```

New admin outreach.

They MUST use separate builders/contracts.

Do not reuse the customer handoff message as the admin outreach message.

## 14.2 New outreach builder

Create one reusable, runtime-neutral/server-safe builder conceptually equivalent to:

```text
buildLeadOutreachWhatsAppMessage()
```

or a project-convention equivalent.

The same builder should be used by:

- Admin Lite “Falar no WhatsApp”;
- M6A notification e-mail “Falar no WhatsApp”.

This prevents copy drift between e-mail and Admin.

## 14.3 Message content

Default company-level message direction:

```text
Olá, {primeiroNome}! Tudo bem?

Aqui é da Atrium. Você realizou nosso diagnóstico e indicou interesse em {objetivoHumano}.

A análise destacou principalmente {principalOportunidadeHumana} como uma oportunidade para sua operação.

{momentoOpcional}

Queria entender um pouco melhor o seu cenário e ver se faz sentido avançarmos em algum desses pontos.

Podemos conversar por aqui?
```

Example with moment:

```text
Olá, João! Tudo bem?

Aqui é da Atrium. Você realizou nosso diagnóstico e indicou interesse em atrair mais clientes.

A análise destacou principalmente estruturar vendas e acompanhamento como uma oportunidade para sua operação.

Você também sinalizou que gostaria de olhar para isso agora / o quanto antes.

Queria entender um pouco melhor o seu cenário e ver se faz sentido avançarmos em algum desses pontos.

Podemos conversar por aqui?
```

## 14.4 Message rules

The customer-facing outreach message MUST NOT include:

- lead score;
- lead tier;
- internal status;
- public diagnostic code unless there is a specific operational need;
- raw enum names;
- internal evidence/debug information;
- `answers_json`;
- language implying surveillance.

It should use only enough diagnostic context to remind the person why Atrium is contacting them.

The administrator can always edit the prefilled WhatsApp message before sending it.

## 14.5 WhatsApp URL

Use canonical phone from M5.1:

```text
https://wa.me/<canonicalPhone>?text=<urlEncodedMessage>
```

The builder must produce correct URL encoding and work with the normalized Brazil-first phone contract.

---

# 15. Admin WhatsApp action semantics

The Admin “Falar no WhatsApp” button:

- opens WhatsApp with the prefilled Atrium outreach message;
- does NOT automatically set `CONTACTED`;
- does NOT update `last_contact_at`;
- does NOT claim that the message was sent.

After actual interaction, the administrator uses:

```text
Registrar contato
```

This explicit separation protects data quality.

---

# 16. M6A notification e-mail integration

The existing M6A lead notification remains asynchronous and independent from lead persistence.

M6B.2 enhances the notification CTA without changing its architecture.

## 16.1 Prefilled WhatsApp CTA

The e-mail button:

```text
Falar no WhatsApp
```

should use the same Atrium-to-customer outreach builder defined above.

It should open WhatsApp with the suggested contextual message already filled in.

A small explanatory microcopy may be used:

> O WhatsApp abrirá com uma mensagem sugerida usando o contexto do diagnóstico. Revise antes de enviar.

## 16.2 No false handoff inference in the first notification

The initial lead notification is triggered immediately after `INSERT`.

Therefore it MUST NOT claim that the visitor did or did not open WhatsApp after registration unless that information is already reliably available at send time.

Do not delay lead notification solely to wait for the handoff event.

A second notification on handoff is OUT OF SCOPE for M6B.2 unless explicitly approved later.

## 16.3 Future Admin deep link

Once the production Admin URL exists, M6A may add:

```text
Abrir lead no Admin
```

using the public code.

This must not block launch and should not expose authenticated data in the URL.

---

# 17. Admin list operational improvements

M6B.2 may extend the current M6B.1 dashboard with the following operational information:

- current commercial status;
- WhatsApp handoff badge;
- `last_contact_at`;
- `next_follow_up_at`;
- overdue follow-up indicator;
- existing tier/score/timeframe/goal fields.

Do not turn the list into a large analytics dashboard.

Priority remains:

```text
What needs attention now?
Who has already been approached?
Who opened WhatsApp after registering?
What is the next follow-up?
```

---

# 18. Operational filters

In addition to M6B.1 filters, M6B.2 may add:

```text
WhatsApp handoff:
- Todos
- Abriu
- Não abriu

Follow-up:
- Todos
- Atrasado
- Hoje
- Próximos
```

All filters must be allowlisted and validated server-side.

The browser must not be allowed to compose arbitrary PostgREST syntax.

---

# 19. Admin detail — operational block

Add a clear operational section to the current lead detail:

```text
ATENDIMENTO

Status
Novo

WhatsApp após diagnóstico
Abriu em 16/09/2026 às 22:21

Último contato
—

Próximo follow-up
—

[Falar no WhatsApp]
[Registrar contato]
[Adicionar observação]
```

When `whatsapp_handoff_at` is null:

```text
WhatsApp após diagnóstico
Não abriu
```

The UI must not equate this field with CONTACTED.

---

# 20. API response DTOs

Admin Edge Functions should continue returning explicit DTOs instead of raw database rows.

M6B.2 may add fields such as:

```text
whatsappHandoffAt
statusUpdatedAt
lastContactAt
nextFollowUpAt
activities
outreachWhatsAppUrl
```

Do not expose:

- internal lead UUID unless required for an internal server operation;
- submission ID to the Admin browser unless technically unavoidable;
- backend keys;
- Turnstile data;
- raw database metadata.

Prefer public code as the browser-facing lead reference.

---

# 21. Logging and privacy

Server logs MUST NOT include:

- JWT;
- Authorization header;
- backend secret;
- full phone number;
- full e-mail address;
- notes content;
- diagnostic answer payload;
- WhatsApp prefilled message body.

Allowed operational logging may include:

- public code;
- action type;
- HTTP status;
- sanitized technical error code;
- admin user UUID only when necessary for security/audit and consistent with project privacy policy.

Activity history is business data, not application logging.

---

# 22. Graceful degradation

## 22.1 Customer handoff tracking fails

```text
lead remains persisted
WhatsApp still opens
commercial status unchanged
```

## 22.2 Admin action fails

UI must:

- not pretend success;
- preserve current visible state;
- show a clear retryable error;
- refetch authoritative state when appropriate.

## 22.3 Activity insert fails

For actions requiring both lead-state mutation and an audit activity, the overall operation must fail atomically rather than leaving an unaudited state change.

## 22.4 WhatsApp is unavailable

Admin still has e-mail/contact information and the rest of the lead detail.

---

# 23. M6B.2 migration rules

Create a new additive migration only.

Do not edit applied migrations.

Migration scope may include:

- new summary fields on `public.mvp_leads`;
- `public.mvp_lead_activities`;
- constraints;
- indexes needed for status, follow-up and activity retrieval;
- least-privilege grants/revokes;
- atomic helper functions/RPCs if chosen.

Before applying remotely:

1. audit existing lead data;
2. run `supabase db push --dry-run`;
3. verify only expected new migration(s);
4. review RLS/grants;
5. run full test/build suite.

No destructive migration should be introduced for this milestone.

---

# 24. Index guidance

Add only indexes justified by Admin operations, for example conceptually:

```text
mvp_leads(status, created_at desc)
mvp_leads(next_follow_up_at) where next_follow_up_at is not null
mvp_leads(whatsapp_handoff_at) where whatsapp_handoff_at is not null
mvp_lead_activities(lead_id, occurred_at desc)
```

Do not create speculative indexes for unused future CRM functionality.

---

# 25. Security tests required for M6B.2

At minimum cover:

## Public handoff tracking

- valid persisted lead identifiers;
- invalid public code;
- invalid submission identifier;
- mismatched pair;
- repeat click idempotency;
- tracking failure does not block WhatsApp;
- no commercial status change;
- no PII in response/logs.

## Admin mutations

- JWT missing -> 401;
- JWT invalid/expired -> 401;
- authenticated non-admin -> 403;
- authorized admin -> allowed action;
- invalid action -> rejected;
- invalid status -> rejected;
- arbitrary field/table mutation impossible;
- no backend secret in frontend;
- CORS exact-origin enforcement;
- no wildcard origin.

## Status

- valid status change;
- no-op rejected or handled explicitly;
- `status_updated_at` changes;
- activity created atomically;
- terminal status confirmation behavior as designed.

## Contact

- explicit contact updates `last_contact_at`;
- NEW may atomically become CONTACTED;
- later status is not downgraded;
- contact activity is created.

## Notes

- note appended;
- length enforced;
- HTML/script rendered as plain text/escaped;
- no overwrite of history.

## Follow-up

- set follow-up;
- replace follow-up with explicit action;
- clear follow-up;
- activity history correct.

## WhatsApp outreach

- canonical phone -> valid wa.me URL;
- first name extraction/fallback;
- humanized goal;
- humanized primary opportunity;
- optional timeframe included only when useful;
- no tier/score/internal status in customer message;
- URL encoding correct;
- e-mail CTA and Admin CTA use the same builder output.

---

# 26. E2E acceptance tests

M6B.2 is not complete until these real flows pass.

## Flow A — visitor does not open WhatsApp

```text
lead created
-> status NEW
-> whatsapp_handoff_at null
-> Admin shows "Não abriu"
-> admin sends contextual outreach
-> admin explicitly records contact
-> status CONTACTED
-> activity timeline updated
```

## Flow B — visitor opens WhatsApp immediately

```text
lead created
-> status NEW
-> visitor clicks public WhatsApp
-> whatsapp_handoff_at recorded
-> status remains NEW
-> Admin shows "Abriu WhatsApp"
-> admin can see that outreach may not be from zero context
```

## Flow C — tracking endpoint unavailable

```text
lead created
-> visitor clicks WhatsApp
-> tracking fails
-> WhatsApp still opens
-> lead remains usable
```

## Flow D — admin unauthorized

```text
valid Supabase Auth user
-> UUID not in ADMIN_USER_IDS
-> mutation denied
-> no lead/activity modified
```

## Flow E — follow-up lifecycle

```text
CONTACTED
-> set next_follow_up_at
-> follow-up becomes due
-> Admin highlights it
-> contact recorded
-> next follow-up cleared/rescheduled
-> history remains intact
```

---

# 27. M6B.2 out of scope

Do NOT add in this milestone:

- WhatsApp Business API;
- proof that WhatsApp message was actually sent/read;
- automatic WhatsApp sending;
- SMS;
- marketing sequences;
- automated nurturing;
- bulk outreach;
- sales pipeline customization;
- custom stages;
- multi-team permissions;
- multi-tenant CRM;
- attachments;
- proposal generator;
- calendar synchronization;
- e-mail inbox synchronization;
- AI-generated sales messages;
- automatic lead scoring changes based on Admin activity;
- second handoff notification e-mail unless explicitly approved later.

Admin Lite remains an internal operational tool, not a CRM product.

---

# 28. Revised milestone definition

## M6B.1 — Admin Auth + Read-only Lead Operations

Status: implemented and E2E-validated against `atrium-dev`.

Responsibilities already established:

- admin login;
- Auth session;
- UUID allowlist authorization;
- secure read-only Edge Function;
- lead list;
- filters/search;
- lead detail;
- human labels;
- WhatsApp/e-mail contact links;
- no direct browser DB access.

## M6B.2 — Lead Operations + Handoff Tracking

Deliver:

- additive database migration;
- `whatsapp_handoff_at` tracking;
- public `track-lead-handoff` function;
- separate handoff badge/filter in Admin;
- `status_updated_at`;
- `last_contact_at`;
- `next_follow_up_at`;
- `mvp_lead_activities` append-only history;
- secure `admin-lead-actions` mutations;
- status updates;
- explicit contact recording;
- notes;
- follow-up scheduling;
- activity timeline;
- contextual Atrium outbound WhatsApp builder;
- prefilled Admin WhatsApp CTA;
- prefilled M6A e-mail WhatsApp CTA;
- full security/regression/E2E validation.

Acceptance:

- clicking public WhatsApp never implies CONTACTED;
- handoff and commercial status remain independently visible;
- all admin mutations require validated Auth user + UUID allowlist;
- all state-changing admin actions are auditable;
- lead summary and history stay consistent atomically;
- customer WhatsApp tracking failure never blocks conversion;
- Admin and e-mail use the same outreach-message contract;
- no service/backend secret in browser;
- no public CRUD grants added;
- mobile Admin remains usable.

---

# 29. Updated roadmap order

Current order:

```text
M0–M5                         completed
M5.1 Contact Input Hardening  completed
M6A Lead Notification         completed
M6B.1 Admin Read-only         completed / validated
M6B.2 Lead Operations         NEXT
M6C Supporting pages
Netlify production deployment
Turnstile real/production
SEO / legal / analytics / polish
final browser + physical-mobile QA
launch
```

No later milestone may silently remove or reinterpret the distinction between:

```text
commercial status
customer WhatsApp handoff
admin-recorded contact
```

---

# 30. Decision log additions

## 2026-09-16 — WhatsApp handoff is not CONTACTED

Decision:

> Opening WhatsApp is tracked separately from commercial status.

Reason:

A URL click cannot prove that the visitor sent a message or that human contact occurred.

## 2026-09-16 — Contact must be explicit

Decision:

> `CONTACTED` is set only by an explicit authorized Admin operation representing real human follow-up.

## 2026-09-16 — Operational history is append-only

Decision:

> Notes, status changes, contact records and follow-up scheduling are represented in `mvp_lead_activities` instead of being collapsed into mutable text fields.

## 2026-09-16 — Outbound WhatsApp copy is shared

Decision:

> Admin and lead-notification e-mail reuse one Atrium-to-customer WhatsApp outreach builder.

Reason:

Avoid copy drift and preserve a consistent professional approach.

## 2026-09-16 — Admin click is not proof of sent message

Decision:

> Clicking the Admin “Falar no WhatsApp” CTA does not update `status` or `last_contact_at` automatically.

Reason:

The system cannot verify actual message delivery without a WhatsApp API. Human contact must be explicitly recorded.

---

# 31. Codex implementation instruction for M6B.2

When M6B.2 implementation begins, Codex must:

1. read the current project SDD completely;
2. merge this v1.3 addendum into the canonical SDD;
3. inspect the current M6B.1 implementation before proposing changes;
4. preserve the read-only security guarantees of M6B.1;
5. propose the additive migration and security model before applying anything;
6. implement one concern at a time;
7. run full regression checks after every security-sensitive change;
8. never deploy, push migrations or commit unless explicitly instructed.

