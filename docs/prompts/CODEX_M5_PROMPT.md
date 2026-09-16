# CODEX M5 — Lead Capture, Supabase & WhatsApp Handoff

Leia integralmente antes de modificar qualquer arquivo:

- `docs/ATRIUM_WEB_MVP_SDD.md`
- `docs/prompts/CODEX_M3_PROMPT.md`
- `docs/prompts/CODEX_M4_PROMPT.md`
- todo o código atual do repositório, com atenção especial a:
  - `domain/diagnostic/*`
  - `domain/lead/*`, caso já exista
  - `components/results/*`
  - `lib/session.ts`
  - `lib/env.ts`
  - `.env.example`
  - `next.config.ts`

O `ATRIUM_WEB_MVP_SDD.md` continua sendo a fonte da verdade.

M0, M1, M2, M3 e M4 estão concluídos e aprovados.

Implemente exclusivamente:

# M5 — LEAD CAPTURE, SUPABASE & WHATSAPP HANDOFF

Não implemente funcionalidades de plataforma, CRM próprio, autenticação de cliente,
LLM, agentes ou qualquer escopo posterior.

---

# 0. OBJETIVO

Transformar um diagnóstico concluído em uma oportunidade comercial registrada,
sem aumentar desnecessariamente o escopo do MVP.

Fluxo desejado:

```text
Resultado do diagnóstico
        ↓
"Quero conversar sobre isso"
        ↓
Identificação mínima
        ↓
Qualificação comercial curta
        ↓
Consentimento
        ↓
Turnstile
        ↓
Supabase Edge Function
        ↓
Lead salvo no PostgreSQL
        ↓
Código público retornado
        ↓
WhatsApp com resumo pré-preenchido
```

Regra de resiliência obrigatória:

> Falha de Supabase, Edge Function, rede ou Turnstile nunca pode impedir a pessoa
> de continuar para o WhatsApp.

Persistência melhora o funil, mas não é ponto único de falha comercial.

---

# 1. PRINCÍPIOS

- Zero custo obrigatório dentro dos free tiers definidos para o MVP.
- Coletar somente dados necessários.
- Nenhum dado sensível.
- Nenhuma autenticação.
- Nenhum painel/CRM próprio.
- Dashboard do Supabase será usado manualmente no início.
- Nenhuma dependência de LLM.
- Nenhum processamento comercial "inteligente" fora de regras determinísticas.
- Nunca expor chave secreta do Supabase no browser.
- Não confiar em dados de score enviados pelo cliente quando eles puderem ser recalculados no backend.
- Não logar payloads com PII.

---

# 2. CHAVES SUPABASE — USAR MODELO ATUAL

O projeto deve preferir o modelo atual de chaves do Supabase:

- browser, quando necessário: publishable key;
- Edge Function/backend: secret key.

Não introduzir nova dependência nos nomes legados `anon` / `service_role`
se não houver necessidade de compatibilidade.

Nunca expor secret key no frontend.

Se a Edge Function utilizar um client administrativo, obter a secret key somente
do ambiente seguro da função.

Não versionar secrets.

---

# 3. BANCO — TABELA `leads`

Criar migration Supabase versionada.

Tabela conceitual:

```text
leads

id                    uuid primary key
submission_id         uuid unique not null
public_code           text unique not null
created_at            timestamptz not null

contact_name          text not null
company_name          text not null
phone                 text not null
email                 text null

business_segment      text null
company_size          text null

primary_goal          text not null
additional_goals      jsonb not null

answers_json          jsonb not null
diagnostic_version    text not null

opportunity_scores    jsonb not null
top_opportunities     jsonb not null
ai_risk_score         integer not null default 0

lead_score            integer not null
lead_tier             text not null

timeframe             text null
budget_range          text null

source                text null
utm_source            text null
utm_medium            text null
utm_campaign          text null
utm_content           text null
utm_term              text null
referrer              text null
landing_page          text null

status                text not null default 'NEW'
internal_notes        text null

consent_contact       boolean not null
consent_at            timestamptz not null
```

Adapte nomes ao padrão do repositório se necessário, preservando a semântica.

Não armazenar:
- CPF/CNPJ completo;
- documento;
- dados de cartão;
- senha;
- token bancário;
- biometria;
- conteúdo sensível desnecessário;
- Turnstile token;
- secret keys;
- IP deliberadamente;
- payloads de debug.

## `public_code`

Gerar server-side/database-side.

Formato humano:

```text
AT-YY-XXXXXX
```

Exemplo:

```text
AT-26-A7K3Q9
```

Requisitos:
- não depender de contador visível de clientes;
- alfanumérico;
- curto o suficiente para WhatsApp;
- unique constraint;
- não gerado pelo browser como fonte confiável.

Pode usar UUID/random seguro server-side e derivar os seis caracteres.

---

# 4. SEGURANÇA DA TABELA

A tabela não deve aceitar insert/read/update/delete diretamente de visitante anônimo.

Requisitos:
- RLS habilitado;
- revogar privilégios de `anon` e `authenticated` que não sejam necessários;
- nenhuma policy pública de SELECT;
- nenhuma policy pública de INSERT;
- gravação ocorre somente pela Edge Function usando credencial secreta backend;
- secret key nunca chega ao frontend.

O dashboard Supabase continua disponível para operação manual.

Adicionar índices apenas onde são úteis ao uso inicial, por exemplo:
- `created_at`;
- `status`;
- `lead_tier`;
- `public_code`.

Não criar dezenas de índices especulativos.

---

# 5. FORMULÁRIO DE CONTATO

A partir do resultado M4, CTA principal deve levar para `/contato`
ou fluxo equivalente definido no SDD.

A experiência deve preservar a sensação premium.

Não criar formulário longo.

Campos obrigatórios:
- Seu nome
- Empresa ou negócio
- WhatsApp (`type="tel"`)
- Consentimento

Campo opcional:
- E-mail

Qualificação curta:
- Quando você gostaria de melhorar isso?
  - Agora / o quanto antes
  - Nos próximos 1–3 meses
  - Nos próximos 3–6 meses
  - Estou explorando

- Já existe uma faixa de investimento em mente? (opcional)
  - Ainda estou entendendo
  - Até R$ 3.000
  - R$ 3.000–7.500
  - R$ 7.500–15.000
  - R$ 15.000–30.000
  - Acima de R$ 30.000

Não bloquear contato por faixa de orçamento.

Consentimento:
`Concordo em enviar meu diagnóstico e meus dados de contato para que a Atrium possa falar comigo sobre esta análise.`

Não pré-marcar.

---

# 6. VALIDAÇÃO DO FORMULÁRIO

Usar Zod ou mecanismo já adotado.

Validar:
- nome e empresa com limites razoáveis;
- telefone não vazio e quantidade plausível de dígitos;
- e-mail válido quando preenchido;
- enums de timeframe/budget;
- consentimento obrigatório;
- tamanho máximo dos campos.

Normalizar:
- trim;
- telefone;
- strings vazias opcionais => null quando adequado.

Não tentar provar se o WhatsApp existe.
Não usar `dangerouslySetInnerHTML`.

---

# 7. ATRIBUIÇÃO / UTM

Capturar no browser, uma única vez por sessão:

- source;
- utm_source;
- utm_medium;
- utm_campaign;
- utm_content;
- utm_term;
- referrer;
- landing_page.

Requisitos:
- persistir em `sessionStorage`;
- preservar primeira origem válida da sessão;
- navegação interna não sobrescreve;
- ausência de UTM é válida;
- não colocar PII na URL;
- só enviar attribution quando existir lead consentido.

Pode usar um client component pequeno e global.

Não introduzir analytics de terceiros.

---

# 8. LEAD SCORE INTERNO

Implementar score determinístico 0–100, invisível ao visitante:

```text
FIT          0–20
DOR          0–20
IMPACTO      0–20
URGÊNCIA     0–15
INVESTIMENTO 0–15
CLAREZA      0–10
TOTAL        0–100
```

Tiers:
```text
A: 75–100
B: 55–74
C: 35–54
D: 0–34
```

Diretrizes:
- FIT: oportunidade real + porte compatível + objetivo atendível; não penalizar por segmento.
- DOR: intensidade, recorrência e fragilidade operacional.
- IMPACTO: pessoas, frequência, horas/mês quando houver, trabalho manual.
- URGÊNCIA: baseada em timeframe.
- INVESTIMENTO: budget; “Ainda estou entendendo” deve ser neutro, não punição extrema.
- CLAREZA: diagnóstico concluído, objetivo definido, respostas suficientes.

Centralizar em função pura/testável.

O valor persistido deve ser recalculado na Edge Function.
Não confiar em `lead_score` vindo do browser.

---

# 9. EDGE FUNCTION `create-lead`

Criar Supabase Edge Function dedicada.

Responsabilidades:
1. POST e OPTIONS;
2. Origin/CORS allowlist;
3. body size limit;
4. JSON parse;
5. schema validation;
6. Turnstile server-side;
7. diagnostic version;
8. normalização;
9. recalcular Lead Score;
10. idempotência via `submission_id`;
11. inserir ou retornar submissão já existente;
12. retornar resposta mínima.

Sucesso:

```json
{
  "success": true,
  "publicCode": "AT-26-A7K3Q9"
}
```

Não retornar score/tier/id interno/answers.

Erros:
- mensagem pública genérica;
- sem stack trace;
- sem PII.

---

# 10. TURNSTILE

Proteger `create-lead` com Cloudflare Turnstile.

Client:
- site key pública por env;
- token enviado no submit.

Server:
- Siteverify obrigatório;
- secret somente Edge Function;
- token não persistido/logado;
- tratar token expirado/reutilizado;
- resetar widget quando necessário.

Quando possível validar:
- `success`;
- action esperada;
- hostname esperado em produção.

Preparar suporte a chaves oficiais de teste em ambiente local.
Nunca versionar segredo real.

---

# 11. CORS / ORIGINS

Variável sugerida:

```text
ALLOWED_ORIGINS
```

Aceitar origens separadas por vírgula.

Produção:
- origem exata;
- sem `*`.

Desenvolvimento:
- localhost/IP local via env;
- sem IP pessoal hardcoded.

Preflight correto.
Rejeitar origem não autorizada.

---

# 12. CONFIGURAÇÃO / ENV

Atualizar `.env.example` apenas com valores vazios/exemplos genéricos.

Públicas possíveis:
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SITE_URL=
```

Privadas da Edge Function:
```text
TURNSTILE_SECRET_KEY=
ALLOWED_ORIGINS=
EXPECTED_TURNSTILE_HOSTNAME=
```

Preferir secrets já fornecidos pelo ambiente Supabase para a chave backend.

Nunca commitar `.env.local`.

---

# 13. FALLBACK COMERCIAL

Requisito crítico:

Falha de Supabase, rede, Edge Function ou Turnstile NÃO bloqueia WhatsApp.

Em falha:
- não afirmar que salvou;
- informar discretamente;
- manter respostas;
- permitir continuar WhatsApp com resumo local;
- sem código público, ou com indicação elegante de “não registrado”.

Copy sugerida:
`Não conseguimos registrar seu diagnóstico agora, mas você ainda pode continuar a conversa pelo WhatsApp.`

Não expor detalhes técnicos.

---

# 14. WHATSAPP BUILDER

Implementar builder puro/testável.

Número por env pública. Não hardcode.

Mensagem na direção:

```text
Olá! Fiz o Diagnóstico Atrium.

Diagnóstico: AT-26-A7K3Q9

EMPRESA
Empresa: XPTO
Segmento: Imobiliário
Equipe: 6–20 pessoas

OBJETIVO
Reduzir trabalho manual

OPORTUNIDADES
1. Automação — Alta
2. Integração — Alta
3. Atendimento — Moderada

MOMENTO
Nos próximos 1–3 meses

Gostaria de conversar sobre essas oportunidades.
```

Regras:
- labels amigáveis;
- no máximo top 3;
- sem answers_json;
- sem lead score/tier;
- sem PII desnecessária;
- URL encode correto.

Fallback: omitir código ou indicar `não registrado` de forma elegante.

---

# 15. ROTA `/contato/whatsapp`

Implementar transição explícita, estática/client-side.

Objetivo:
- mostrar código quando houver;
- botão “Abrir WhatsApp”;
- servir depois como pageview do funil.

Não redirecionar automaticamente sem o usuário perceber.

Não colocar answers na query string.
Preferir sessionStorage.

---

# 16. SUCESSO

Após salvar:

```text
Diagnóstico recebido.

AT-26-A7K3Q9

Agora você pode continuar a conversa no WhatsApp.
```

Não prometer SLA, resposta imediata ou análise humana já feita.

---

# 17. PRIVACIDADE

Como há PII, garantir transparência.

Se `/privacidade` ainda não existir, implementar página estática mínima necessária
com práticas realmente presentes:

- dados coletados;
- finalidade;
- respostas do diagnóstico;
- attribution/UTM;
- Supabase como infraestrutura;
- Turnstile contra abuso;
- não venda de dados.

Não inventar:
- CNPJ;
- endereço;
- DPO;
- prazo jurídico específico;
- garantias não definidas.

Checkbox deve linkar `/privacidade`.

---

# 18. SESSION / LIMPEZA

Não apagar diagnóstico imediatamente após salvar.
Usuário deve conseguir voltar se WhatsApp não abrir.

Não armazenar PII em localStorage permanente.
Se necessário durante handoff, usar sessionStorage e limpar de forma razoável depois.

---

# 19. IDEMPOTÊNCIA

Prevenir double submit.

Client:
- loading/disabled;
- `submissionId` UUID por tentativa/sessão.

DB:
- `submission_id uuid unique not null`.

Server:
- repetição do mesmo `submission_id` retorna lead existente;
- não cria duplicado.

Não usar Turnstile token como idempotency key.

---

# 20. RATE / ABUSE

Não construir rate limiter complexo.

Baseline:
- Turnstile;
- validation;
- body limit;
- origin allowlist.

Não armazenar IP deliberadamente só para rate limit.

---

# 21. TESTES

Cobrir pelo menos:

Form:
- obrigatórios;
- email opcional;
- telefone;
- consentimento;
- loading;
- erro;
- fallback.

Attribution:
- captura inicial;
- UTM ausente;
- não sobrescreve.

Lead Score:
- 0–100;
- tiers A/B/C/D;
- budget desconhecido neutro;
- urgência;
- cenários forte/fraco.

WhatsApp:
- encoding;
- até 3 oportunidades;
- sem lead score;
- com code;
- fallback sem code.

Idempotência:
- submission id única;
- migration unique.

Privacy:
- link presente.

Separar funções puras da Edge Function para testá-las com runner existente.

Não criar snapshots gigantes.

---

# 22. TESTE LOCAL SEM SUPABASE REAL

A UI deve funcionar sem credenciais backend reais.

Sem configuração:
- não quebrar;
- entrar em fallback controlado;
- WhatsApp continua testável por env;
- indicar apenas em desenvolvimento que persistence não está configurada.

Não criar mock ativável acidentalmente em produção.

---

# 23. DOCUMENTAÇÃO DE SETUP

Criar documento curto em `docs/` com passos:

1. criar Supabase Free;
2. linkar CLI;
3. aplicar migration;
4. configurar secrets Edge Function;
5. configurar Turnstile;
6. configurar env local;
7. servir/deploy `create-lead`;
8. validar insert;
9. validar fallback desligando endpoint.

Sem secrets reais.

---

# 24. FORA DO M5

Não implementar:
- login/auth;
- área de cliente;
- CRM/admin;
- realtime;
- e-mail transacional;
- WhatsApp Business API;
- mensagem automática;
- proposta automática;
- pagamento;
- LLM;
- agentes;
- multi-tenancy;
- plataforma Atrium;
- analytics dashboard;
- CMS.

---

# 25. VALIDAÇÃO MANUAL

Testar:

Sucesso:
Resultado → Contato → Submit → código → WhatsApp.

Falha Supabase:
Resultado → Contato → falha → aviso → WhatsApp disponível.

Turnstile inválido:
Sem insert; retry/fallback coerente.

Refresh:
Resultado preservado.

Double click:
Sem duplicar.

Mobile real 375/390:
- campos;
- checkbox;
- Turnstile;
- erro;
- sucesso;
- handoff.

Desktop 1440.

Sem sessão:
`/contato` não cria lead vazio; orientar a fazer diagnóstico.

---

# 26. CHECKS FINAIS

Executar:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Confirmar:
- static export das páginas Next;
- sem API Route Next;
- sem Server Action;
- backend somente na Supabase Edge Function;
- secret não aparece no bundle;
- nenhuma PII em logs.

---

# 27. ENTREGA

Relatar:

1. resumo;
2. arquivos criados;
3. arquivos modificados;
4. migration;
5. RLS/grants;
6. Edge Function;
7. Turnstile;
8. CORS;
9. Lead Score;
10. tiers;
11. attribution;
12. formulário;
13. consentimento;
14. idempotência;
15. WhatsApp;
16. fallback;
17. privacidade;
18. envs;
19. setup Supabase/Turnstile;
20. testes;
21. checks;
22. divergências SDD;
23. confirmação de que nenhum escopo posterior foi implementado.

Não faça commit.

Pare após concluir M5.
