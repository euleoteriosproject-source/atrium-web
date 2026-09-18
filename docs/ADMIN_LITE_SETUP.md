# Admin Lite — configuração do M6B.1 e M6B.2

O Admin Lite mantém o frontend como static export. O navegador autentica diretamente no Supabase Auth com a publishable key. `admin-leads` continua exclusivamente para leitura e `admin-lead-actions` aceita somente as cinco ações tipadas do M6B.2. As funções validam o JWT no Supabase Auth, conferem a allowlist privada e somente então usam a credencial de backend.

Não existe acesso direto do browser ao PostgREST, grant ou policy para `anon`/`authenticated`. O browser nunca chama as RPCs. `admin-lead-actions` delega cada comando validado para uma RPC transacional `SECURITY INVOKER`, de modo que o resumo do lead e sua atividade sejam persistidos juntos ou não sejam persistidos.

## 1. Criar a conta administrativa

No Supabase Dashboard, abra **Authentication → Users → Add user** e crie manualmente a conta com e-mail e senha. Não habilite cadastro público no frontend.

Copie o UUID do usuário criado. Não use e-mail como autorização: a identidade autorizada é o UUID imutável retornado pelo Supabase Auth.

## 2. Configurar a allowlist privada

Configure os UUIDs permitidos, separados por vírgula:

```bash
supabase secrets set ADMIN_USER_IDS=00000000-0000-4000-8000-000000000000
```

Também mantenha `ALLOWED_ORIGINS` com as origens exatas do frontend. `SUPABASE_URL`, as publishable keys e as backend secret keys são fornecidas pelo ambiente hospedado do Supabase; para execução local, use as variáveis equivalentes suportadas pelas funções.

`ADMIN_USER_IDS` é secret exclusiva das Edge Functions administrativas e nunca deve usar prefixo `NEXT_PUBLIC_`.

## 3. Migration aditiva do M6B.2

As migrations aditivas `202609170001_m6b2_lead_operations.sql`,
`202609170002_revoke_mvp_leads_browser_privileges.sql` e
`202609170003_enforce_mvp_lead_contacted_semantics.sql`:

- adiciona os quatro timestamps operacionais em `public.mvp_leads`;
- cria `public.mvp_lead_activities` append-only, com RLS/FORCE RLS e sem policies públicas;
- registra `LEAD_CREATED` por trigger na mesma transação do INSERT;
- cria as RPCs privadas e atômicas de handoff e ações administrativas;
- revoga acesso direto de `public`, `anon` e `authenticated`, incluindo o
  hardening contra eventual drift de grants em `public.mvp_leads`.
- garante no banco que `NEW → CONTACTED` somente ocorra quando o timestamp de
  contato for registrado na mesma operação atômica de `RECORD_CONTACT`.

Antes de aplicar remotamente, audite os dados, execute `supabase db push --dry-run` e confirme que apenas a nova migration esperada aparece. Este documento não autoriza `db push`.

## 4. Deploy das funções

Depois dos testes, da aplicação aprovada da migration e da aprovação do milestone:

```bash
supabase functions deploy admin-leads
supabase functions deploy admin-lead-actions
supabase functions deploy track-lead-handoff
supabase functions deploy notify-new-lead
```

`notify-new-lead` precisa de novo deploy porque o CTA do e-mail M6A passou a usar o mesmo builder contextual Atrium → cliente do Admin.

`verify_jwt = false` em `admin-leads` e `admin-lead-actions` é intencional: cada função administrativa valida o bearer token em `/auth/v1/user` e distingue sessão inválida (`401`) de usuário autenticado fora da allowlist (`403`). Isso não desabilita autenticação da operação.

`track-lead-handoff` também usa `verify_jwt = false` porque o visitante não possui sessão. Seu contrato exige o par aleatório `submissionId + publicCode`, origem exata, payload pequeno e rate limit; a função pode apenas registrar o primeiro handoff e não altera status ou contato.

## 5. E2E manual e revogação

1. Acesse `/admin/login` e entre com a conta criada.
2. Confirme listagem, filtros, paginação, detalhe, indicador/filtro de handoff e timeline.
3. Entre com outro usuário válido fora de `ADMIN_USER_IDS`: o acesso deve ser negado sem revelar dados.
4. Remova o UUID de `ADMIN_USER_IDS` e atualize o secret para revogar o acesso; uma nova consulta deve retornar `403`.
5. Use **Sair** e confirme o redirecionamento para o login.
6. Em um lead `NEW`, registre contato e confirme `CONTACTED`, `last_contact_at` e as duas atividades na mesma operação.
7. Teste mudança/correção de status, nota, definir/substituir/remover follow-up e recarregue o detalhe após cada ação.
8. No fluxo público persistido, clique em **Abrir WhatsApp**: a janela deve abrir mesmo se o tracking falhar; quando funcionar, `whatsapp_handoff_at` deve ser gravado uma vez e o status deve permanecer inalterado.
9. Repita o clique e confirme que timestamp e atividade não duplicam.
10. Confirme que o CTA do Admin e o CTA do e-mail M6A abrem a mesma mensagem contextual Atrium → cliente.

Não registre JWTs, senhas, chaves, observações ou PII nos logs. Para revogação imediata de uma sessão, também encerre/remova a sessão do usuário no Supabase Auth.

## Limites do M6B.2

O M6B.2 não adiciona CRM genérico, pipeline configurável, scheduler, envio automático de WhatsApp, prova de mensagem enviada/lida, gestão de usuários ou edição/exclusão de atividades. `whatsapp_handoff_at` registra somente que o visitante abriu o canal; `CONTACTED` exige a ação administrativa explícita **Registrar contato**.
