CODEX M3 — Diagnostic Engine

Leia integralmente antes de modificar qualquer arquivo:

docs/ATRIUM_WEB_MVP_SDD.md

todo o código atual do repositório

os componentes do Design System existentes

a homepage atual, principalmente os CTAs que apontam para /diagnostico

O arquivo ATRIUM_WEB_MVP_SDD.md é a fonte da verdade.

M0, M1 e M2 estão concluídos e aprovados.

Sua tarefa agora é implementar exclusivamente o M3 — Diagnostic Engine definido no SDD.

Não implemente M4 ou qualquer milestone posterior.

OBJETIVO DO M3

Construir o motor determinístico do Diagnóstico Atrium e a experiência interativa de /diagnostico.

Ao final deste milestone, o visitante deve conseguir:

entrar no diagnóstico;

receber uma pré-seleção quando vier de um CTA compatível;

responder perguntas em uma experiência guiada;

seguir somente os caminhos relevantes ao seu contexto;

voltar para perguntas anteriores sem corromper o estado;

atualizar respostas já dadas;

ter os scores de oportunidade recalculados deterministicamente;

recuperar o progresso após refresh dentro da mesma sessão;

concluir o conjunto de perguntas aplicável.

M3 não entrega ainda o resultado comercial final.

A normalização final, seleção das três oportunidades, biblioteca de insights, evidence chips e página final de resultado pertencem ao M4.

1. PRINCÍPIOS OBRIGATÓRIOS

O diagnóstico deve parecer uma consulta guiada curta, não um formulário corporativo ou pesquisa longa.

Obrigatório:

uma pergunta principal por tela;

mobile-first;

interação rápida;

opções grandes e clicáveis;

teclado acessível;

touch targets >= 44px;

progresso perceptível, sem precisão falsa;

em geral 8–12 respostas por visitante;

respostas opcionais claramente identificadas;

possibilidade de voltar;

estado preservado em sessionStorage;

nenhuma conta/login;

nenhuma dependência de IA/LLM;

nenhuma chamada de rede necessária para responder;

branching e scoring 100% determinísticos e testáveis.

Não transformar a interface em uma sequência visual de:

Pergunta 1 de 27

O progresso deve indicar avanço sem sugerir que todos os usuários percorrem a mesma quantidade de perguntas.

2. ESCOPO EXATO DO SDD

Implemente fielmente as seções do SDD referentes a:

10. Diagnostic product specification

10.1 UX rules

10.2 Diagnostic state model

11. Universal diagnostic questions

12. Branch — AUTOMATION

13. Branch — SALES / CONVERSION

14. Branch — SERVICE

15. Branch — WEBSITE

16. Branch — SOFTWARE

17. Branch — INTEGRATION

18. Branch — AI

19. Branch — DISCOVERY

20. Opportunity scoring, apenas o acúmulo determinístico necessário ao engine; a apresentação/normalização final pertence ao M4

21. AI priority adjustment, apenas os dados/estado necessários; apresentação final pertence ao M4

42.3 State

43. Suggested repository structure

45. Diagnostic component architecture

47. Testing strategy

55 / M3 — Diagnostic engine

Não reescreva perguntas, opções ou pesos sem necessidade técnica comprovada.

Se houver ambiguidade, siga o SDD e registre a decisão no relatório final.

3. MODELO DE DOMÍNIO

Utilize o modelo definido no SDD como base canônica.

Versão do diagnóstico:

1.0.0

Tipos centrais incluem:

type Goal =
  | 'SALES'
  | 'CONVERSION'
  | 'AUTOMATION'
  | 'SERVICE'
  | 'WEBSITE'
  | 'SOFTWARE'
  | 'INTEGRATION'
  | 'AI'
  | 'DISCOVERY';

type OpportunityDimension =
  | 'digital'
  | 'sales'
  | 'service'
  | 'automation'
  | 'integration'
  | 'software'
  | 'ai';

O estado deve seguir a estrutura do SDD e conter, no mínimo:

version;

startedAt;

primaryGoal;

additionalGoals;

segment;

companySize;

acquisitionChannels;

tools;

answers;

opportunityScores;

aiRiskScore;

calculator context quando existir.

Não use any para o estado central.

Prefira unions, schemas e tipos explícitos.

4. ARQUITETURA DATA-DRIVEN

As perguntas devem ser declarativas.

Não espalhe pergunta, opções, regra de branching e score dentro de JSX de página.

Estrutura esperada, adaptando somente se houver razão clara:

domain/diagnostic/
  types.ts
  questions.ts
  branching.ts
  scoring.ts

components/diagnostic/
  diagnostic-provider.tsx
  diagnostic-shell.tsx
  progress-header.tsx
  question-renderer.tsx
  single-choice-question.tsx
  multi-choice-question.tsx
  numeric-question.tsx
  text-question.tsx
  navigation-controls.tsx

lib/
  session.ts

Não implementar ainda no M3:

insights.ts
result.ts
lead-score.ts

exceto se já existirem stubs necessários do SDD, sem lógica de M4/M5.

5. QUESTION DEFINITIONS

Cada pergunta deve possuir identificador estável, por exemplo:

Q001

Q002

A001

S001

C001

W001

SO001 ou o ID exato escolhido conforme SDD

I001

AI001

D001

A definição deve ser capaz de representar, quando aplicável:

{
  id,
  branch,
  type,
  question,
  description?,
  options?,
  optional?,
  minSelections?,
  maxSelections?,
  showWhen?,
  validate?,
}

Scoring e branching podem estar em módulos separados, desde que continuem declarativos e rastreáveis.

Não codifique regras de negócio diretamente nos componentes visuais.

6. Q001 — OBJETIVOS

Implementar exatamente os objetivos do SDD:

SALES — Atrair mais clientes

CONVERSION — Converter mais oportunidades em vendas

AUTOMATION — Reduzir trabalho manual

SERVICE — Melhorar atendimento

WEBSITE — Criar ou melhorar meu site

SOFTWARE — Criar um sistema

INTEGRATION — Integrar ferramentas

AI — Usar inteligência artificial

DISCOVERY — Quero descobrir oportunidades

Comportamento:

permitir múltipla seleção;

se houver mais de uma seleção, exigir definição de uma principal;

preservar as demais em additionalGoals;

pré-seleção via query param deve funcionar;

usuário pode alterar a pré-seleção.

Aplicar os pesos iniciais exatamente como definidos no SDD.

7. PERGUNTAS UNIVERSAIS

Implementar Q002–Q005 conforme SDD:

segmento;

tamanho da operação;

canais de aquisição;

ferramentas utilizadas.

Preservar opções, copy e efeitos de score definidos no documento.

companySize influencia Lead Score no M5, portanto no M3 apenas armazene a resposta corretamente; não implemente Lead Score.

8. BRANCHING

Após as perguntas universais, o fluxo deve usar o primaryGoal para selecionar o ramo principal.

Implementar todos os ramos definidos no SDD:

AUTOMATION;

SALES / CONVERSION;

SERVICE;

WEBSITE;

SOFTWARE;

INTEGRATION;

AI;

DISCOVERY.

8.1 Goals adicionais

Não obrigue o visitante a percorrer integralmente todos os ramos dos additionalGoals.

O primary goal é o principal determinante da jornada V1.

Additional goals devem permanecer no estado e contribuir apenas onde o SDD explicitamente permitir.

Evite transformar múltipla escolha inicial em um diagnóstico de 30 perguntas.

8.2 Condicionais internas

Respeitar perguntas condicionais, por exemplo:

problemas do site somente quando já existe site;

perguntas complementares de processo somente quando aplicáveis;

regras específicas do ramo SOFTWARE;

requisitos mínimos da integração;

lógica de risco humano no ramo AI;

interrupção antecipada de DISCOVERY conforme SDD.

9. DISCOVERY — EARLY STOP

Implementar a regra do SDD:

Interromper o scanner DISCOVERY quando:

pelo menos 3 dimensões já tiverem evidência forte; e

o visitante tiver respondido pelo menos 7 perguntas totais relevantes do diagnóstico.

Não criar uma definição científica nova de “evidência forte”.

Use uma regra simples, determinística e documentada compatível com os scores do SDD.

Ela deve estar centralizada e testada.

10. SCORING ENGINE

O score é contador de evidências, não nota de maturidade.

Implemente uma função pura que seja capaz de recalcular os opportunityScores a partir das respostas atuais.

Prefira recalcular a partir das respostas em vez de apenas incrementar/decrementar mutavelmente ao navegar.

Motivo:

usuário pode voltar;

mudar uma resposta;

remover uma seleção;

trocar objetivo;

recuperar sessão.

O resultado deve ser idempotente.

Exemplo conceitual:

const scores = calculateOpportunityScores(state);

A mesma entrada deve sempre produzir a mesma saída.

Respeitar todos os pesos do SDD.

Permitir valores negativos somente onde o SDD explicitamente define isso, como alguns sinais do ramo AI.

aiRiskScore deve ser calculado separadamente conforme as respostas de risco.

Não exibir scores brutos ao usuário.

11. IA — RISCO E REVISÃO HUMANA

No M3, armazenar e calcular corretamente:

aplicabilidade de IA;

aiRiskScore;

possibilidade de revisão humana.

Não gerar ainda a recomendação textual final.

Não aplicar linguagem comercial de M4.

Certifique-se apenas de que M4 terá todos os dados necessários para executar a regra de ajuste prevista no SDD.

12. SESSION STORAGE

Persistir o diagnóstico em sessionStorage.

Requisitos:

chave versionada;

armazenamento somente no browser;

nenhuma chamada externa;

refresh deve recuperar o ponto apropriado;

dados incompatíveis/corrompidos devem ser descartados com segurança;

nova versão incompatível deve iniciar diagnóstico limpo;

não quebrar SSR/static export por acesso a window ou sessionStorage durante render server-side.

Sugestão conceitual:

atrium:diagnostic:1.0.0

Não é obrigatório usar exatamente esse nome se já houver convenção melhor no projeto.

Implementar funções claras como:

loadDiagnosticSession;

saveDiagnosticSession;

clearDiagnosticSession.

Não persistir dados de contato — eles pertencem ao M5.

13. INÍCIO / RESET

A experiência deve permitir:

iniciar diagnóstico limpo;

continuar sessão existente quando apropriado;

reiniciar explicitamente se o usuário quiser começar de novo.

Não apagar silenciosamente respostas válidas ao navegar entre telas.

Quando query params de pré-seleção entrarem em conflito com sessão existente, adote uma regra simples e previsível e documente-a.

Preferência:

uma intenção explícita nova via CTA/preselection pode iniciar contexto novo;

refresh comum deve preservar sessão.

Não crie modal complexo apenas para resolver isso.

14. PRESELECTION POR URL

Suportar no mínimo:

/diagnostico?goal=DISCOVERY
/diagnostico?goal=WEBSITE
/diagnostico?goal=AUTOMATION
/diagnostico?goal=SOFTWARE
/diagnostico?goal=AI

E qualquer outro Goal válido previsto no SDD.

Requisitos:

parâmetros inválidos devem ser ignorados;

não provocar erro;

objetivo válido deve aparecer pré-selecionado;

usuário mantém liberdade de alteração.

Não confie em query param sem validação.

15. PRELOAD DA CALCULADORA DA HOMEPAGE

O CTA Analisar esse processo da calculadora deve poder abrir /diagnostico e carregar contexto suficiente para:

preselecionar AUTOMATION;

carregar quantidade de pessoas;

minutos por dia;

dias por semana;

horas mensais estimadas.

A fórmula continua a mesma do SDD:

monthly_minutes = people * minutes_per_day * days_per_week * 4.33
monthly_hours = monthly_minutes / 60

Escolha um mecanismo estático e simples, preferencialmente query params validados ou sessionStorage compartilhado.

Não adicionar backend.

Se usar query params, os nomes devem ser curtos mas explícitos e centralizados; não espalhar strings mágicas.

O preload não deve responder automaticamente perguntas que não são equivalentes aos dados da calculadora.

Ele pode preencher apenas aquilo que é semanticamente suportado pelos dados coletados.

16. UX DE /diagnostico

Criar a rota:

/diagnostico

A experiência visual precisa ser Atrium, mas diferente da homepage:

menos distrações;

mais foco;

uma pergunta por vez;

bastante espaço;

sensação de processo orientado;

navegação simples.

Entrada sugerida pelo SDD:

Vamos entender sua operação.

Não vamos começar perguntando qual tecnologia você quer. Vamos começar entendendo o que você gostaria de melhorar.

Não inventar um onboarding longo.

A primeira ação deve levar rapidamente à Q001.

17. DIAGNOSTIC SHELL

Criar/usar componentes compatíveis com a arquitetura recomendada:

DiagnosticProvider
  -> DiagnosticShell
      -> ProgressHeader
      -> QuestionRenderer
          -> SingleChoiceQuestion
          -> MultiChoiceQuestion
          -> NumericQuestion
          -> TextQuestion
      -> NavigationControls

Adapte nomes se necessário, mas preserve separação de responsabilidade.

QuestionRenderer deve decidir qual componente de entrada usar a partir da definição da pergunta.

Não criar JSX específico por ID de pergunta quando um renderer genérico resolver corretamente.

Perguntas excepcionalmente complexas podem ter render específico, mas documente o motivo.

18. COMPONENTES DE ESCOLHA

Utilize ou crie conforme o Design System:

RadioCard;

MultiSelectCard;

QuestionScreen;

DiagnosticShell;

progresso.

Estados necessários:

default;

hover;

selected;

focus-visible;

disabled, quando aplicável;

error/validation.

Não usar checkboxes pequenos como interface principal para escolhas importantes.

Cards clicáveis precisam continuar semanticamente acessíveis.

19. PROGRESSO

Como os caminhos possuem tamanhos diferentes, não usar porcentagem falsa baseada em um total fixo global.

Pode usar:

barra relativa à jornada atualmente calculada;

etapas conceituais;

ou progresso aproximado baseado nas perguntas aplicáveis já determinadas.

A solução precisa:

avançar de forma estável;

não saltar absurdamente;

não exibir 37% como se fosse ciência exata;

funcionar quando o ramo DISCOVERY termina cedo.

Se o componente atual Progress exigir número, utilize um valor derivado de perguntas aplicáveis atuais e não exponha o número textual ao usuário.

20. NAVEGAÇÃO

Obrigatório:

botão continuar quando necessário;

botão voltar após a primeira pergunta;

respostas de single-select podem avançar automaticamente apenas se a experiência continuar acessível e não parecer brusca;

multi-select deve exigir ação explícita de continuar;

validação clara quando seleção é obrigatória;

Enter/Space devem funcionar corretamente conforme elemento;

foco deve ser levado para o heading/pergunta nova após mudança de tela de maneira acessível.

Não permitir avançar com estado inválido.

Ao voltar, preservar resposta existente.

21. FINALIZAÇÃO DO M3

Quando todas as perguntas aplicáveis forem respondidas:

marcar o diagnóstico local como completo;

garantir que todos os scores estejam atualizados;

salvar estado final na sessão;

fornecer uma transição técnica limpa para o M4.

Não implementar a UI final de resultado neste milestone.

Preferência:

manter uma tela mínima de conclusão interna no /diagnostico, ou

criar apenas o boundary mínimo necessário para M4,

sem implementar:

cards de oportunidades;

níveis finais apresentados ao usuário;

biblioteca de insights;

evidence chips;

formulário de contato;

WhatsApp.

A implementação escolhida deve evitar um 404 na jornada local durante desenvolvimento e ser fácil de substituir no M4.

Não escrever copy comercial de resultado que não pertence ao M3.

22. NÃO IMPLEMENTAR NESTE MILESTONE

Explicitamente proibido:

insight library final;

ResultCard final;

seleção das top 3 oportunidades para apresentação;

textos de recomendação finais;

evidence chips finais;

OpportunityLevel público final;

/diagnostico/resultado completo;

formulário de nome/empresa/WhatsApp;

timeframe comercial;

budget comercial;

Lead Score;

Supabase;

PostgreSQL;

migration;

Edge Function;

Turnstile;

UTM persistence comercial;

WhatsApp builder;

envio de lead;

fallback da API;

páginas de soluções;

case detalhado;

página Sobre;

páginas legais;

autenticação;

CRM;

CMS;

LLM;

agentes;

multi-tenancy.

Não criar API route.

Não criar Server Action.

Não adicionar backend.

23. STATIC EXPORT

O projeto deve continuar compatível com:

output: 'export'

Não introduzir qualquer recurso que dependa de runtime Node/Next em produção.

Query params devem ser tratados client-side quando necessário.

Nenhuma rota dinâmica server-side.

24. TESTES OBRIGATÓRIOS

Adicionar testes de domínio e comportamento com foco em valor.

24.1 Scoring

Testar no mínimo:

score inicial de cada primary goal;

WhatsApp + planilha;

transferência manual frequente;

follow-up inexistente;

perguntas repetitivas de atendimento;

site sem gerar leads;

integração manual;

AI high-volume;

AI risk separado;

alteração de resposta recalcula corretamente em vez de acumular score duplicado.

24.2 Branching

Testar no mínimo:

AUTOMATION abre perguntas A;

SALES e CONVERSION usam branch comercial;

SERVICE abre C;

WEBSITE respeita existência do site;

SOFTWARE segue condicionais do SDD;

INTEGRATION exige contexto adequado;

AI mostra perguntas de risco;

DISCOVERY early-stop funciona;

perguntas de outros branches não aparecem indevidamente.

24.3 Session

Testar:

save/load válido;

versão incompatível;

JSON corrompido;

reset;

refresh recovery quando possível com setup de teste.

24.4 URL preselection

Testar:

goal válido;

goal inválido;

calculator preload válido;

valores negativos/absurdos da calculadora não quebram o estado.

24.5 UI

Testar comportamentos relevantes:

não avança sem resposta obrigatória;

back preserva resposta;

multi-select;

alteração de primary goal;

foco/semântica essencial.

Evite snapshots gigantes.

Não teste Tailwind por texto de classe sem necessidade.

25. ACESSIBILIDADE

Manter o padrão estabelecido em M1/M2.

Obrigatório:

navegação por teclado;

foco claramente visível;

fieldset/legend ou semântica equivalente quando apropriado;

labels associados;

status/erros anunciáveis;

headings corretos;

foco gerenciado ao avançar/voltar;

prefers-reduced-motion;

nada que dependa somente de cor para indicar seleção.

Executar auditoria axe na experiência principal em desktop e mobile.

26. RESPONSIVIDADE

Validar no mínimo:

375px;

768px;

1440px;

1920px.

Em mobile:

opções devem ocupar largura confortável;

botões de navegação devem permanecer acessíveis;

nenhuma pergunta deve exigir scroll horizontal;

escolhas devem ser confortáveis ao toque;

teclado virtual não deve quebrar campos de texto/número.

27. PERFORMANCE E DEPENDÊNCIAS

Não adicionar biblioteca de form/state management apenas por conveniência.

React state/context deve ser preferido enquanto suficiente.

Não adicionar:

Redux;

Zustand sem necessidade comprovada;

React Hook Form se a arquitetura atual não justificar;

máquina de estados externa apenas para esse fluxo;

biblioteca de survey/form builder.

O engine é parte estratégica da Atrium e deve permanecer compreensível no repositório.

Qualquer nova dependência precisa ser justificada no relatório final.

28. INTEGRAÇÃO MÍNIMA COM HOMEPAGE

Pode modificar somente o necessário na homepage para que CTAs existentes funcionem com M3:

/diagnostico?goal=DISCOVERY;

outras preseleções previstas no SDD;

calculator preload.

Não refatore nem redesenhe homepage.

Não alterar copy aprovada.

29. VALIDAÇÃO MANUAL OBRIGATÓRIA

Antes de finalizar, percorrer no navegador pelo menos estes cenários completos:

Cenário A — Automação

Empresa com:

WhatsApp + planilhas;

tarefa diária;

múltiplas pessoas;

cópia de dados;

retrabalho.

Confirmar que o engine acumula forte evidência em automação/integração.

Cenário B — Vendas

Empresa com:

lead no WhatsApp/planilha;

resposta lenta;

pouco follow-up;

contexto perdido.

Confirmar evidência comercial coerente.

Cenário C — Site

Empresa com site que não gera/acompanha oportunidades.

Confirmar branch e scores coerentes.

Cenário D — IA de alto risco

Uso plausível de IA + consequência alta de erro + baixa revisão humana.

Confirmar que aiRiskScore fica registrado corretamente para M4.

Cenário E — Discovery

Respostas com pelo menos três áreas fortes.

Confirmar early-stop após mínimo de respostas definido no SDD.

Cenário F — Calculator preload

Partir da calculadora da homepage e confirmar que os dados válidos chegam ao contexto do diagnóstico.

30. CHECKS FINAIS

Executar obrigatoriamente:

pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build

Confirmar:

out/index.html continua sendo gerado;

/diagnostico está incluído no export estático;

nenhuma Server Action;

nenhuma API route;

nenhuma funcionalidade server-side;

nenhuma chamada Supabase;

nenhuma implementação de M4/M5.

31. RELATÓRIO FINAL

Ao concluir, responda com:

resumo do que foi implementado;

arquivos criados;

arquivos modificados;

estrutura do domínio do diagnóstico;

quantidade de perguntas declaradas por branch;

explicação da estratégia de branching;

explicação da estratégia de recalcular scores;

regra implementada para DISCOVERY early-stop;

estratégia de sessionStorage e versionamento;

parâmetros de preselection suportados;

forma de preload da calculadora;

componentes de UI criados/reutilizados;

decisões de acessibilidade;

dependências adicionadas e justificativa — idealmente nenhuma;

cenários manuais testados;

quantidade e resultado dos testes automatizados;

resultado de format/lint/typecheck/test/build;

divergências ou ambiguidades encontradas no SDD;

confirmação explícita de que M4 e milestones posteriores não foram implementados.

Não faça commit.

Não avance para M4.

Pare após entregar o relatório do M3.