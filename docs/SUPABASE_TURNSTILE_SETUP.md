# Supabase e Turnstile — setup do M5

Este fluxo mantém o frontend estático. A única escrita pública acontece pela Edge Function `create-lead`, protegida por validação, CORS e Cloudflare Turnstile.

## 1. Criar e vincular o Supabase

1. Crie um projeto no plano Free.
2. Instale/autentique a Supabase CLI conforme a documentação oficial.
3. Execute `supabase link --project-ref SEU_PROJECT_REF`.
4. Aplique `supabase/migrations/202609110001_create_leads.sql` com `supabase db push`.

A tabela `public.mvp_leads` usa RLS, não possui policies públicas e revoga acesso de `anon` e `authenticated`. A operação inicial é feita manualmente pelo dashboard do Supabase.

## 2. Configurar a Data API

No Dashboard do projeto, configure a Data API com o menor escopo necessário para este MVP:

- **Enable Data API:** `ON`;
- **Exposed schemas:** incluir `public`;
- **Exposed tables:** incluir somente `mvp_leads`;
- **Automatically expose new tables:** `OFF`.

Expor a tabela na Data API apenas permite que o PostgREST reconheça a rota. Isso não concede acesso aos roles `anon` ou `authenticated`: `public.mvp_leads` continua com os privilégios revogados para ambos, sem policies públicas e com RLS habilitado. A escrita da Edge Function permanece autenticada exclusivamente pela credencial secreta de backend (`service_role` ou secret key moderna), nunca pela publishable key do frontend.

### Override do PostgREST no role `authenticator`

Uma configuração manual em `pgrst.db_schemas` no role `authenticator` pode sobrescrever os schemas expostos configurados pelo Dashboard. Use a consulta abaixo somente para diagnóstico:

```sql
select rolname, rolconfig
from pg_roles
where rolname = 'authenticator';
```

Se `rolconfig` contiver um override antigo incompatível, como `pgrst.db_schemas=career_os`, **não o remova cegamente**. Primeiro verifique se aplicações existentes ainda dependem desse schema e avalie o impacto da mudança.

Quando a intenção confirmada for devolver ao Dashboard o controle dos schemas expostos, execute:

```sql
alter role authenticator reset pgrst.db_schemas;
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
```

## 3. Configurar o Turnstile

1. Crie um widget no Cloudflare Turnstile.
2. Configure os hostnames de produção e preview realmente usados.
3. Para desenvolvimento, use somente as chaves dummy oficiais do Turnstile.
4. Coloque apenas a site key pública em `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

Nunca coloque o secret do Turnstile em arquivo público ou variável `NEXT_PUBLIC_*`.

## 4. Configurar secrets da Edge Function

Configure no ambiente Supabase, sem versionar valores reais:

```bash
supabase secrets set TURNSTILE_SECRET_KEY=...
supabase secrets set TURNSTILE_TEST_MODE=false
supabase secrets set ALLOWED_ORIGINS=https://seu-dominio.example
supabase secrets set EXPECTED_TURNSTILE_ACTION=create_lead
supabase secrets set EXPECTED_TURNSTILE_HOSTNAME=seu-dominio.example
```

`ALLOWED_ORIGINS` aceita origens exatas separadas por vírgula. Não use `*`. No ambiente hospedado, a função usa a chave `default` do mapa `SUPABASE_SECRET_KEYS` fornecido automaticamente pelo Supabase. O ambiente local da CLI pode fornecer `SUPABASE_SECRET_KEY`; `SUPABASE_SERVICE_ROLE_KEY` fica restrita à compatibilidade legada. As chaves atuais são enviadas ao PostgREST somente no header `apikey`, pois não são JWTs.

`TURNSTILE_TEST_MODE` só é ativado pelo valor exato `true`, desconsiderando espaços nas extremidades. Qualquer outro valor mantém o modo de produção. Em desenvolvimento, use somente as chaves dummy oficiais e configure:

```text
TURNSTILE_TEST_MODE=true
```

Nesse modo, o Siteverify e `success: true` continuam obrigatórios, mas action e hostname não são validados porque a resposta dummy não representa os valores configurados pelo widget. Não use `TURNSTILE_TEST_MODE=true` com credenciais reais nem em produção.

Em produção, configure explicitamente:

```text
TURNSTILE_TEST_MODE=false
EXPECTED_TURNSTILE_ACTION=create_lead
EXPECTED_TURNSTILE_HOSTNAME=<hostname real>
```

Em produção, use credenciais reais e mantenha `TURNSTILE_TEST_MODE=false`. Fora do modo de teste, a action e o hostname reais precisam ser validados. `EXPECTED_TURNSTILE_ACTION` aceita uma única action e é comparada por igualdade exata com a resposta do Siteverify; quando ausente ou vazia, usa o default seguro `create_lead`.

## 5. Configurar o frontend

Copie `.env.example` para `.env.local` e preencha somente valores públicos:

```text
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

O número de WhatsApp deve incluir código do país. A publishable key é opcional quando o gateway não a exige; `supabase/config.toml` deixa a verificação JWT desabilitada porque a submissão pública é protegida pelo Turnstile e pelas validações da função.

## 6. Servir e publicar

1. Para servir localmente, use `supabase functions serve create-lead --env-file supabase/.env.local`.
2. Inclua a origem local exata em `ALLOWED_ORIGINS`, por exemplo `http://localhost:3000`.
3. Publique com `supabase functions deploy create-lead`.
4. Gere o frontend estático com `pnpm build`.

## 7. Validar

1. Conclua um diagnóstico e envie o formulário de contato.
2. Confirme o insert em `public.mvp_leads` no dashboard e o formato `AT-YY-XXXXXX`.
3. Repita uma requisição com o mesmo `submission_id` e um novo token válido; ela deve retornar o lead existente.
4. Confirme que score e tier não aparecem na resposta pública.
5. Desligue a função ou remova temporariamente a URL no ambiente local: o fluxo deve informar que não registrou e ainda permitir abrir o WhatsApp.
6. Teste origem não permitida, payload inválido e Turnstile inválido; nenhum deles deve gerar insert.

Não registre payloads ou PII nos logs durante estes testes.

Antes do lançamento público, revise a redação jurídica da página de privacidade
e confirme os canais oficiais da empresa sem inventar dados ainda não definidos.
