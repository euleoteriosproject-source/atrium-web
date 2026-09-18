# Publicação do Atrium Web MVP na Netlify

Este guia prepara o primeiro deploy do frontend. Ele não substitui o deploy separado das Edge Functions, migrations ou secrets do Supabase.

## A. Pré-requisitos

- repositório disponível no GitHub;
- branch `main` protegida e com CI verde;
- Node.js 22 e pnpm 11.4.0, coerentes com o CI e `package.json`;
- projeto Supabase e Edge Functions já operacionais;
- valores públicos de produção aprovados para WhatsApp, Supabase e Turnstile;
- acesso administrativo ao projeto Netlify, ao Supabase e ao Cloudflare Turnstile.

O frontend permanece um export estático. `next.config.ts` usa `output: "export"`, `pnpm build` gera `out`, e a hospedagem não precisa de SSR, API Routes, Server Actions ou runtime Node/Next.

## B. Conectar o GitHub e criar o site

1. Na Netlify, abra **Add new site > Import an existing project**.
2. Escolha **GitHub** e autorize somente o repositório necessário.
3. Selecione o repositório do Atrium Web MVP.
4. Defina `main` como **Production branch** depois de integrar e aprovar a branch de trabalho.
5. Confirme as opções de build da próxima seção.
6. Não publique enquanto os valores públicos mínimos não estiverem revisados.

Preview deploys podem permanecer habilitados, mas não devem receber secrets de backend. Se um preview precisar submeter leads ou abrir o Admin, a sua origem exata também terá de ser autorizada no Supabase; não autorize curingas por conveniência.

## C. Configuração de build

O `netlify.toml` versionado define:

| Configuração | Valor |
| --- | --- |
| Production branch | `main` |
| Build command | `pnpm build` |
| Publish directory | `out` |
| Node.js | `22` |
| Next Runtime plugin | desativado com `NETLIFY_NEXT_PLUGIN_SKIP=true` |

`NETLIFY_NEXT_PLUGIN_SKIP=true` é deliberado: o projeto usa o export estático nativo do Next.js e não deve ser convertido pela Netlify em aplicação SSR/híbrida. A variável é apenas uma opção de build, não um secret.

Não adicione redirect global para `index.html`. As rotas possuem arquivos HTML próprios, e um fallback de SPA esconderia respostas 404 reais. A resolução de Pretty URLs da Netlify atende caminhos como `/sobre` usando o arquivo estático exportado correspondente.

## D. Variáveis do frontend na Netlify

Configure em **Site configuration > Environment variables** com escopo de produção. Somente estas cinco variáveis públicas são consumidas pelo bundle:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

Orientações:

- `NEXT_PUBLIC_SITE_URL`: URL canônica completa, sem barra final, por exemplo `https://<site>.netlify.app`;
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número oficial de atendimento aceito pela validação do projeto;
- `NEXT_PUBLIC_SUPABASE_URL`: URL pública do projeto Supabase;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publishable para uso no browser;
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: site key pública correspondente ao hostname de produção.

Tudo que possui o prefixo `NEXT_PUBLIC_` é incorporado ao JavaScript/HTML no build e deve ser tratado como público.

## E. Secrets que permanecem somente no Supabase

Não crie estas variáveis no site Netlify e nunca use o prefixo `NEXT_PUBLIC_` nelas:

```text
SUPABASE_SECRET_KEYS
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
TURNSTILE_SECRET_KEY
TURNSTILE_TEST_MODE
EXPECTED_TURNSTILE_ACTION
EXPECTED_TURNSTILE_HOSTNAME
ALLOWED_ORIGINS
ADMIN_USER_IDS
LEAD_NOTIFICATION_EMAIL
LEAD_NOTIFICATION_FROM
LEAD_NOTIFICATION_PROVIDER_API_KEY
LEAD_WEBHOOK_SECRET
```

As chaves e configurações acima pertencem ao ambiente das Supabase Edge Functions. `SUPABASE_URL` e as publishable keys disponibilizadas pelo runtime hospedado do Supabase também não precisam ser copiadas para a Netlify sob nomes privados.

## F. Primeiro deploy e URL canônica

Como a URL `*.netlify.app` só existe depois que o site é criado, a publicação acontece em duas etapas:

1. configure as quatro variáveis públicas já conhecidas; no bootstrap, omita `NEXT_PUBLIC_SITE_URL` — o schema atual permite sua ausência;
2. execute o primeiro deploy e copie a URL HTTPS exata atribuída pela Netlify;
3. opcionalmente escolha o nome definitivo do site antes de continuar, para evitar nova troca de hostname;
4. adicione `NEXT_PUBLIC_SITE_URL=https://<site>.netlify.app` em **Site configuration > Environment variables**;
5. acione **Deploys > Trigger deploy > Deploy site** para gerar novamente o bundle;
6. confirme no HTML publicado que metadata e URLs canônicas já usam a URL final.

Não use `localhost` como `NEXT_PUBLIC_SITE_URL` no build de produção. Se um domínio próprio for adotado, repita a atualização e o rebuild usando a URL canônica definitiva.

## G. CORS das Edge Functions

Após conhecer a URL Netlify, atualize no ambiente Supabase a variável server-side com origens exatas separadas por vírgula:

```text
ALLOWED_ORIGINS=https://<site>.netlify.app,http://localhost:3000
```

Mantenha `http://localhost:3000` somente enquanto ele for necessário ao desenvolvimento. Não use `*` e não inclua barra final. Os valores são comparados por origem exata.

As funções que usam `ALLOWED_ORIGINS` são:

- `create-lead`;
- `track-lead-handoff`;
- `admin-leads`;
- `admin-lead-actions`.

`notify-new-lead` não é chamada pelo browser: ela autentica o Database Webhook com `LEAD_WEBHOOK_SECRET` e não entra nesta lista de CORS.

Atualizar o secret remoto exige o procedimento operacional do Supabase e, quando aplicável, novo deploy das funções. Isso não é executado durante a preparação da Netlify.

## H. Supabase Auth para o Admin

Depois de obter o hostname definitivo, abra **Supabase Dashboard > Authentication > URL Configuration** e prepare:

```text
Site URL: https://<site>.netlify.app
Redirect URLs:
https://<site>.netlify.app/admin
https://<site>.netlify.app/admin/login
```

Adicione as URLs equivalentes do domínio próprio quando ele se tornar a URL canônica. Evite wildcard amplo em produção. Um padrão de preview só deve ser incluído se houver decisão explícita de habilitar o Admin em previews.

O login atual usa password grant diretamente em `/auth/v1/token`, valida a sessão em `/auth/v1/user` e atualiza tokens em `/auth/v1/token?grant_type=refresh_token`; portanto, não depende de redirect OAuth para funcionar. Mesmo assim, `Site URL` e a allowlist devem apontar para a produção correta antes de usar fluxos de e-mail, recuperação ou qualquer redirecionamento futuro. Signup público deve continuar desabilitado.

## I. Turnstile de produção

Não troque as credenciais durante o bootstrap. Após fixar o hostname Netlify:

1. crie ou ajuste no Cloudflare Turnstile um widget de produção autorizado para `<site>.netlify.app` e para o futuro domínio próprio, se aplicável;
2. na Netlify, configure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` com a site key pública real e faça rebuild;
3. no ambiente das Supabase Edge Functions, configure:

```text
TURNSTILE_TEST_MODE=false
EXPECTED_TURNSTILE_ACTION=create_lead
EXPECTED_TURNSTILE_HOSTNAME=<site>.netlify.app
TURNSTILE_SECRET_KEY=<secret real de produção>
```

O hostname não inclui protocolo nem caminho. Nunca reutilize `TURNSTILE_TEST_MODE=true` ou credenciais dummy em produção.

## J. Rotas estáticas e refresh direto

O relatório do build deve conter estas 19 rotas estáticas do App Router, incluindo `/_not-found`:

```text
/
/_not-found
/admin
/admin/lead
/admin/login
/cases/cred-marvi
/contato
/contato/whatsapp
/diagnostico
/diagnostico/resultado
/privacidade
/sobre
/solucoes
/solucoes/automacoes-e-integracoes
/solucoes/ia-aplicada
/solucoes/sistemas-sob-medida
/solucoes/sites-e-experiencias
/solucoes/sites-e-portais
/termos
```

No diretório `out`, o Next.js também materializa `404.html` como alias de hospedagem para `/_not-found.html`; por isso a inspeção física encontra 20 arquivos HTML, sem representar uma vigésima rota da aplicação.

Após o deploy, abra pelo menos `/diagnostico/resultado`, `/admin/login`, `/admin/lead`, uma rota `/solucoes/*` e `/cases/cred-marvi` diretamente em nova aba e recarregue. Cada uma deve responder com seu HTML exportado. Uma URL inexistente deve continuar exibindo o 404, não a homepage.

## K. Smoke test pós-deploy

### Público

- [ ] homepage, header, menu desktop e menu mobile;
- [ ] páginas de soluções, case e sobre;
- [ ] diagnóstico completo e resultado após refresh;
- [ ] contato e máscara/limites do formulário;
- [ ] submissão real de um lead e persistência única;
- [ ] registro do handoff e abertura do WhatsApp mesmo se o tracking falhar;
- [ ] e-mail M6A recebido com CTA contextual correto;
- [ ] páginas de privacidade, termos e 404.

### Admin

- [ ] `/admin` sem sessão encaminha para `/admin/login`;
- [ ] login allowlisted, restauração/refresh da sessão e listagem;
- [ ] detalhe do lead e timeline;
- [ ] alteração de status e registro de contato;
- [ ] nota append-only;
- [ ] definir e limpar follow-up;
- [ ] WhatsApp contextual;
- [ ] logout remove a sessão e volta ao login.

### Segurança

- [ ] usuário sem login não lê dados administrativos;
- [ ] usuário autenticado fora de `ADMIN_USER_IDS` recebe acesso negado;
- [ ] chamadas diretas do browser a `/rest/v1/mvp_leads` e `/rest/v1/mvp_lead_activities` permanecem negadas;
- [ ] páginas Admin continuam com `noindex`;
- [ ] bundle publicado não contém backend keys, secrets nem PII de teste;
- [ ] CORS aceita somente as origens exatas previstas.

### Mobile

- [ ] menu abre/fecha e links funcionam após reload;
- [ ] diagnóstico e resultado em 375 px e 390 px;
- [ ] máscara de telefone e validações do contato;
- [ ] Turnstile real completa no dispositivo;
- [ ] WhatsApp abre com fallback adequado;
- [ ] login, lista, detalhe e ações essenciais do Admin.

## L. Rollback básico

Se o frontend apresentar regressão:

1. abra **Deploys** na Netlify;
2. selecione o último deploy de produção conhecido como estável;
3. use **Publish deploy** para restaurar os arquivos estáticos anteriores;
4. confirme homepage, diagnóstico, contato e Admin;
5. corrija a branch `main` e publique um novo build validado.

O rollback da Netlify afeta somente o frontend. Não reverta migrations, Edge Functions ou dados do Supabase como parte desse procedimento. Se o incidente for causado por envs, restaure os valores anteriores e gere um novo deploy, porque variáveis `NEXT_PUBLIC_*` são fixadas no bundle durante o build.
