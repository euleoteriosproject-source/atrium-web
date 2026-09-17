# Notificação de novos leads — M6A

O M6A notifica o administrador depois que um novo lead já foi persistido. O fluxo é:

```text
public.mvp_leads AFTER INSERT
  → Supabase Database Webhook
  → Edge Function notify-new-lead
  → Resend Email API
```

O `INSERT` em `public.mvp_leads` é a fonte de verdade. Database Webhooks são assíncronos e disparam depois da alteração da linha; portanto, falhas do webhook, da Edge Function ou do Resend não revertem nem modificam o lead. A função de notificação não acessa o banco.

## 1. Configurar o provider

O adapter inicial usa a API HTTP do Resend diretamente, sem SDK. Antes do uso real:

1. crie uma API key restrita ao envio de e-mail;
2. verifique no Resend o domínio usado pelo remetente;
3. defina um destinatário administrativo válido;
4. não use endereços pessoais ou secrets no repositório.

O contrato `EmailProvider` fica isolado em `supabase/functions/_shared/email-provider.ts`, permitindo trocar o provider sem alterar a validação do webhook.

## 2. Configurar os secrets

Defina os quatro valores privados no ambiente das Edge Functions:

```bash
supabase secrets set LEAD_NOTIFICATION_EMAIL=...
supabase secrets set LEAD_NOTIFICATION_FROM=...
supabase secrets set LEAD_NOTIFICATION_PROVIDER_API_KEY=...
supabase secrets set LEAD_WEBHOOK_SECRET=...
```

- `LEAD_NOTIFICATION_EMAIL`: destinatário administrativo;
- `LEAD_NOTIFICATION_FROM`: remetente verificado, por exemplo `Atrium <leads@dominio-verificado.example>`;
- `LEAD_NOTIFICATION_PROVIDER_API_KEY`: API key do Resend;
- `LEAD_WEBHOOK_SECRET`: valor aleatório e forte, exclusivo para este webhook.

Nenhum desses valores pode usar o prefixo `NEXT_PUBLIC_`. O valor de `LEAD_WEBHOOK_SECRET` deve ser o mesmo no secret da função e no header do Database Webhook.

## 3. Fazer deploy

Depois de configurar os secrets:

```bash
supabase functions deploy notify-new-lead
```

`supabase/config.toml` define `verify_jwt = false` para essa função porque a chamada do Database Webhook não usa JWT de usuário. A autenticação da aplicação acontece no próprio handler pelo header secreto `x-atrium-webhook-secret`.

## 4. Criar o Database Webhook

No Supabase Dashboard:

1. abra **Database → Webhooks** e crie um webhook;
2. selecione schema `public` e tabela `mvp_leads`;
3. marque somente o evento `INSERT`;
4. use a Edge Function `notify-new-lead`, método `POST`;
5. mantenha `Content-Type: application/json`;
6. adicione o header `x-atrium-webhook-secret` com o mesmo valor de `LEAD_WEBHOOK_SECRET`;
7. salve e deixe o webhook habilitado.

Não configure eventos `UPDATE` ou `DELETE`. Não exponha esse secret no frontend, em screenshots ou em documentação versionada.

## 5. Testar manualmente

Para testar o fluxo completo:

1. conclua o diagnóstico e envie um lead novo pelo fluxo público;
2. confirme primeiro a presença do registro em `public.mvp_leads`;
3. confirme a execução de `notify-new-lead` nos logs de Edge Functions;
4. confirme a entrega no painel do Resend e na caixa administrativa;
5. valide que o e-mail não contém `answers_json`, `submission_id`, Turnstile, IDs internos ou secrets.

Para testar apenas o endpoint, envie por `POST` um payload de Database Webhook com dados fictícios, `type: "INSERT"`, `schema: "public"`, `table: "mvp_leads"`, `old_record: null` e o header `x-atrium-webhook-secret`. Nunca reutilize PII real em testes manuais.

## 6. Diagnosticar falhas

- consulte o histórico do Database Webhook no Dashboard e os registros do schema `net` para confirmar status e tentativas;
- consulte os logs da Edge Function procurando somente por `publicCode`, resultado, status do provider e código técnico sanitizado;
- consulte o painel do Resend para rejeições de remetente, domínio, destinatário ou rate limit;
- confirme que os quatro secrets existem, sem imprimir seus valores;
- confirme que o webhook envia exatamente o header `x-atrium-webhook-secret`.

Mesmo quando a função responde `401`, `400`, `502` ou `503`, o lead inserido anteriormente permanece salvo. Corrija a configuração e teste com um **novo** lead; a função não atualiza status, não cria registros e não altera `public.mvp_leads`.
