# CODEX M4 — Diagnostic Results

Leia integralmente antes de modificar qualquer arquivo:

- `docs/ATRIUM_WEB_MVP_SDD.md`
- `docs/prompts/CODEX_M3_PROMPT.md`
- todo o código atual do repositório, com atenção especial a:
  - `domain/diagnostic/*`
  - `components/diagnostic/*`
  - `lib/session.ts`

O `ATRIUM_WEB_MVP_SDD.md` continua sendo a fonte da verdade.

M0, M1, M2 e M3 estão concluídos e aprovados.

Implemente exclusivamente:

# M4 — DIAGNOSTIC RESULTS

Não implemente M5 ou qualquer milestone posterior.

## Objetivo

Transformar as respostas e scores já produzidos pelo Diagnostic Engine em um resultado claro, útil e comercialmente convincente, sem IA, sem backend e sem coleta de lead.

A pessoa deve sentir: “A Atrium entendeu como minha operação funciona e apontou onde vale investigar primeiro.”

O resultado NÃO deve parecer quiz, score de maturidade inventado, dashboard genérico, relatório automático com falsa precisão, propaganda de IA ou tentativa de vender a solução mais cara.

## Escopo

Implementar:
- rota estática `/diagnostico/resultado`;
- geração determinística das oportunidades;
- ranking/priorização;
- níveis de oportunidade;
- biblioteca de insights;
- evidências derivadas das respostas;
- tratamento específico de IA e risco;
- composição visual final do resultado;
- persistência/recovery via estado existente em `sessionStorage`;
- comportamento quando não existe diagnóstico concluído;
- testes de domínio e UI.

Não implementar:
- formulário de lead;
- nome/empresa/telefone/e-mail;
- consentimento;
- Lead Score;
- Supabase;
- Edge Functions;
- Turnstile;
- código público do lead;
- WhatsApp builder;
- CRM;
- analytics de conversão;
- LLM/agentes.

## Fonte de dados

Utilizar exclusivamente respostas atuais do M3, scores atuais do M3, `aiRiskScore`, objetivo principal, metadados locais já existentes e dados de preload da calculadora quando presentes.

Não inferir fatos que o usuário não informou. Não criar dados artificiais para “enriquecer” o resultado.

## Dimensões

Preservar as dimensões existentes no domínio:
- Digital / presença digital
- Sales / vendas e conversão
- Service / atendimento
- Automation / automação
- Integration / integração
- Software / sistema sob medida
- AI / IA aplicada

Usar os nomes públicos/copy definidos no SDD. Não mostrar identificadores internos.

## Sem pontuação numérica pública

Não mostrar 82/100, 7 pontos, maturidade 63%, percentuais ou barras inventadas.

Converter scores em níveis semânticos conforme o SDD, na direção:
- Oportunidade alta
- Oportunidade moderada
- Baixa prioridade neste momento

Se algum threshold estiver ambíguo, centralize em constantes de domínio, escolha conservadora e reporte a decisão no final.

## Top oportunidades

Gerar no máximo 3 oportunidades principais.

Requisitos:
- ranking determinístico;
- mesmas respostas => mesma ordem;
- sem aleatoriedade;
- desempate estável;
- objetivo principal só pode servir como desempate/priorização quando coerente com o SDD;
- não promover dimensão apenas porque a Atrium vende aquele serviço.

Se houver menos de 3 dimensões relevantes, mostrar somente as relevantes. Não preencher o terceiro card artificialmente.

## Modelo de domínio

Criar modelo tipado semelhante a:

```ts
type OpportunityResult = {
  dimension: OpportunityDimension;
  level: OpportunityLevel;
  title: string;
  summary: string;
  whyItMatters: string;
  whatToEvaluate: string;
  evidence: EvidenceItem[];
  caution?: string;
};
```

Separar cálculo, seleção, copy/insights e apresentação React. Não gerar textos por grandes blocos de `if/else` dentro da página.

## Biblioteca de insights

Criar biblioteca determinística de insights/regras. Cada insight deve ter condição de aplicação, dimensão, texto suportado pela resposta, evidências relacionadas e prioridade/especificidade quando necessário.

Exemplo conceitual:

Se há tarefa diária, cópia manual entre ferramentas e múltiplas pessoas:

Título: “Reduzir movimentação manual de informações”

Resumo: “Parte do processo depende de transferir informações manualmente entre ferramentas utilizadas na mesma rotina.”

Por que vale investigar: “Processos recorrentes com transferência manual aumentam retrabalho e dependência operacional.”

O que avaliar: “Uma integração ou fluxo estruturado pode reduzir etapas manuais sem exigir um sistema inteiro.”

Evidências: “Processo diário”, “Dados copiados manualmente”, “Múltiplas pessoas envolvidas”.

Não inventar economia, percentuais de redução ou benefícios quantitativos não suportados.

## Evidence chips

Cada oportunidade pode mostrar 2–4 evidências reais derivadas das respostas, como:
- Uso diário
- WhatsApp na operação
- Planilhas no processo
- Dados copiados manualmente
- Múltiplas pessoas envolvidas
- Follow-up manual
- Perguntas repetitivas
- Ferramentas desconectadas
- Processo depende de pessoa específica
- Site não gera oportunidades
- Alto volume de texto
- Decisão com impacto relevante

A evidência só pode aparecer quando diretamente suportada. Não duplicar chips equivalentes.

## Especificidade

Preferir texto específico quando houver evidência.

Ruim: “Sua empresa pode se beneficiar de automação.”

Melhor: “Você informou que uma tarefa recorrente envolve transferência manual de informações entre ferramentas. Isso indica uma oportunidade relevante para automatizar parte do fluxo.”

Não citar ferramenta não selecionada.

## IA e AI Risk

Manter `aiRiskScore` separado do score de oportunidade de IA.

Se IA for aplicável e risco for alto, usar caution obrigatória na direção:
“IA pode ajudar nesta atividade, mas o cenário informado exige controles e revisão humana.”

Quando risco alto:
- destacar cautela;
- recomendar supervisão;
- evitar autonomia irrestrita;
- não esconder risco;
- não transformar risco em medo.

Quando IA não for prioridade, é desejável dizer que automações/integrações tradicionais parecem resolver o principal problema antes de existir necessidade real de IA.

## Calculadora / horas mensais

Se `monthlyHours` existir e for relevante para automação, pode ser usado como evidência, sempre com linguagem aproximada.

Não afirmar que todas as horas serão eliminadas. Não converter em economia financeira automaticamente. Preservar o disclaimer da calculadora.

Quando a origem vier de faixa aberta conservadora, evite falsa precisão; use algo como “aproximadamente 60+ horas/mês” quando fizer mais sentido.

## Página `/diagnostico/resultado`

Criar experiência premium consistente com Atrium.

Estrutura:

### Header
Reutilizar navegação compartilhada quando apropriado.

### Introdução
Eyebrow: “SEU DIAGNÓSTICO”

Heading na direção: “Encontramos oportunidades que vale investigar.”

Texto curto deixando claro que é uma leitura inicial baseada nas respostas fornecidas. Não usar “auditoria” e não afirmar que é análise humana.

### Resumo de contexto
Mostrar apenas informações úteis, como objetivo principal, segmento e tamanho da operação, sem virar ficha burocrática.

### Oportunidades
Até 3 blocos numerados editorialmente (01/02/03), cada um com título, nível, resumo, por que vale investigar, o que avaliar, evidence chips e caution quando aplicável.

Evitar aparência de dashboard.

### Bloco de interpretação
Mensagem na direção: “Isso não significa que sua empresa precise implementar tudo agora.”

Reforçar começar pela oportunidade de maior valor, que a solução pode ser menor que um sistema completo e que tecnologia deve seguir o problema.

### Próximo passo
Criar apenas o espaço/CTA necessário para o milestone seguinte. Pode apontar para rota futura prevista no SDD, mas NÃO coletar contato, NÃO abrir WhatsApp real, NÃO salvar lead e NÃO chamar Supabase.

Também permitir voltar ao diagnóstico e revisar respostas/recomeçar conforme UX do SDD.

## Acesso direto sem estado

Se acessar `/diagnostico/resultado` sem diagnóstico concluído válido, não mostrar resultado vazio. Mostrar estado elegante: “Precisamos entender sua operação antes de gerar o diagnóstico.” com CTA “Começar diagnóstico”, ou redirecionamento seguro se já for padrão do projeto.

Não gerar scores default como se fossem respostas reais.

## Refresh

Se o diagnóstico foi concluído e a página for atualizada, o resultado deve continuar disponível via estado versionado em `sessionStorage`.

## Voltar e alterar

O usuário deve poder voltar a `/diagnostico`, alterar resposta e gerar resultado novamente. O resultado deve refletir o novo estado. Respostas são a fonte da verdade; resultado é derivado.

## Versão

Preservar `diagnosticVersion`. Estado inválido/incompatível deve ser tratado sem quebrar a página.

## Arquitetura sugerida

Manter domínio separado da UI. Estrutura possível:

```text
domain/diagnostic/
  results.ts
  insights.ts
  evidence.ts
```

Componentes possíveis:

```text
components/results/
  result-shell.tsx
  opportunity-card.tsx
  evidence-chip.tsx
  result-summary.tsx
```

Nomes podem variar. Priorizar funções puras, testes de domínio, tipagem explícita e baixa dependência de React no cálculo.

## Design

Usar o Design System existente.

Direção:
- editorial;
- premium;
- espaço generoso;
- 01/02/03 como recurso discreto;
- navy/off-white;
- dourado como acento;
- níveis legíveis sem depender só de cor.

Não usar gráfico radar, gauge, velocímetro, pizza, score 87%, dashboard corporativo, excesso de ícones ou semáforo vermelho/amarelo/verde como única codificação.

## Mobile

Resultado precisa funcionar muito bem em ~390px. Uma coluna, padding controlado, evidence chips quebrando corretamente, títulos sem overflow e CTA acessível.

Validar 375, 390, 768, 1440 e 1920 px.

## Acessibilidade

Manter headings hierárquicos, landmarks, foco visível, keyboard, contraste, níveis com texto e não apenas cor, evidence chips compreensíveis, reduced motion e links/botões semânticos.

## SEO / privacidade

A rota de resultado deve ser `noindex` e, se apropriado pelo SDD, `nofollow`.

Não colocar respostas pessoais em metadata. Não serializar diagnóstico em query string. Nada sensível em URL.

## Testes obrigatórios

Cobrir pelo menos:

### Ranking
- mesma entrada => mesma ordem;
- top 3 no máximo;
- menos de 3 quando não há relevância suficiente;
- desempate estável.

### Levels
- thresholds aplicados corretamente.

### Evidence
- só aparece quando suportada;
- desaparece quando resposta muda;
- sem duplicação.

### Insights
- automação manual;
- integração;
- vendas/conversão;
- website;
- software;
- atendimento;
- IA.

### AI risk
- alta aplicabilidade + alto risco gera caution;
- IA baixa/não prioritária pode recomendar automação convencional antes.

### Refresh/session
- resultado recuperado do estado válido;
- sem estado => não gera resultado falso.

### Recalculation
- alterar resposta muda resultado;
- nenhum insight antigo permanece indevidamente.

### UI
- heading;
- níveis;
- top opportunities;
- evidências;
- estado sem diagnóstico;
- navegação básica.

Não criar snapshots gigantes.

## Cenários de aceitação

### A — Automação forte
Tarefa diária, múltiplas pessoas, transferência manual, planilhas/ferramentas, alto esforço.
Esperado: Automação entre prioridades; Integração quando suportada; evidências específicas; sem promessa financeira.

### B — Vendas
Leads, resposta demorada, ausência de follow-up, registro manual.
Esperado: Vendas/Conversão entre prioridades; automação/integração somente quando respostas sustentarem.

### C — Website
Site existe, não gera oportunidades, objetivo é captação/qualificação.
Esperado: presença digital relevante; texto focado em função do site, não apenas redesign.

### D — IA aplicável e risco alto
Esperado: IA pode aparecer; caution obrigatória; revisão humana/controles; nenhuma autonomia irrestrita.

### E — IA não prioritária
Esperado: automação/integração podem vir antes; texto pode dizer explicitamente que IA não parece prioridade atual.

### F — Pouca evidência
Esperado: não inventar 3 oportunidades; mostrar somente o sustentado; linguagem honesta.

## Não alterar M3 sem necessidade

Não reescrever o Diagnostic Engine para acomodar M4. Derivar a partir das respostas existentes. Se houver incompatibilidade real, fazer a menor alteração e documentar. Não alterar pesos do M3 silenciosamente.

## Não implementar M5

Proibido implementar:
- lead form;
- Supabase;
- tabela `leads`;
- Edge Function;
- Turnstile;
- Lead Score interno;
- budget qualification;
- consent;
- WhatsApp payload;
- código AT-*;
- status comercial;
- UTMs salvas no banco.

## Validação final

Executar:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Confirmar `/diagnostico/resultado` exportado estaticamente, sem APIs, Server Actions, Supabase ou funcionalidade server-side nova.

## Entrega final

Ao terminar, responder com:
1. resumo da implementação;
2. arquivos criados;
3. arquivos modificados;
4. modelo de ranking;
5. regras de níveis;
6. estrutura da biblioteca de insights;
7. tratamento de evidências;
8. tratamento de AI risk;
9. comportamento sem session;
10. comportamento após refresh;
11. comportamento após alterar respostas;
12. responsividade;
13. acessibilidade;
14. testes adicionados;
15. resultados de format/lint/typecheck/test/build;
16. ambiguidades do SDD encontradas e como foram tratadas;
17. confirmação explícita de que M5 não foi implementado.

Não faça commit.
Não avance para M5.
Pare após entregar o relatório do M4.
