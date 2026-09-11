Leia integralmente antes de modificar qualquer arquivo:

- docs/ATRIUM_WEB_MVP_SDD.md
- todo o código atual do repositório
- os primitives existentes do Design System

O ATRIUM_WEB_MVP_SDD.md é a fonte da verdade.

M0 e M1 estão concluídos e aprovados.

Implemente exclusivamente:

M2 — HOMEPAGE ATRIUM

Não implemente M3 ou qualquer milestone posterior.

OBJETIVO

Construir a homepage final do Atrium Web MVP utilizando o Design System existente.

A homepage não é uma apresentação técnica da Atrium.

Ela deve conduzir o visitante por esta sequência psicológica:

1. "Eu tenho esse problema."
2. "Talvez isso não precise continuar assim."
3. "A Atrium parece entender isso."
4. "Quero descobrir o que poderia melhorar na minha empresa."

A página deve transmitir:

- confiança
- sofisticação
- maturidade
- tecnologia aplicada
- engenharia séria
- proximidade
- clareza

Não deve parecer:

- agência de marketing
- fábrica genérica de software
- template SaaS
- startup genérica de IA
- consultoria corporativa antiquada
- landing page agressiva de venda

COPY

Use a copy definitiva definida no SDD.

Não substitua por textos genéricos.

Não invente slogans novos se o SDD já especificar o conteúdo.

A assinatura institucional:

"Tecnologia que transforma operação em resultado."

deve permanecer coerente com a marca.

ESTRUTURA OBRIGATÓRIA

A homepage deve conter, nesta ordem:

01. Header / navegação
02. Hero
03. Reconhecimento de problemas
04. CTA para Diagnóstico Atrium
05. Hoje → Operação melhor
06. Soluções Atrium
07. "Não sabe do que precisa?"
08. Calculadora de trabalho manual — somente interface/experiência permitida pelo M2 conforme SDD; não implementar ainda integração comercial ou diagnóstico completo
09. Como trabalhamos
10. Case Cred Marvi
11. Segurança e responsabilidade
12. Founder / experiência
13. "Pode ser mais simples do que parece"
14. FAQ
15. CTA final
16. Footer

HERO

O hero deve utilizar a direção definida no SDD.

Mensagem central:

"Sua empresa pode trabalhar melhor."

A homepage precisa comunicar rapidamente que a Atrium resolve problemas operacionais usando a tecnologia apropriada, sem vender tecnologia pela tecnologia.

Os principais CTAs devem seguir a estratégia:

- Descobrir oportunidades
- Tenho um projeto em mente

O CTA principal pode apontar para /diagnostico, mesmo que a rota seja implementada somente no milestone seguinte.

Não implemente o diagnóstico dentro da homepage.

HERO VISUAL

Criar uma composição própria e elegante.

Não utilizar:

- stock photo
- robô
- cérebro
- circuitos clichês
- dashboards falsos
- elementos cyberpunk
- partículas decorativas pesadas

Prefira uma representação abstrata de:

processos desconectados → organização → fluxo

ou conceito equivalente coerente com o SDD.

Use HTML/CSS/SVG quando apropriado.

A visualização precisa funcionar também no mobile.

RECONHECIMENTO DE PROBLEMAS

Essa seção deve fazer o empresário reconhecer situações reais.

Usar os problemas definidos no SDD, como:

- planilhas
- WhatsApp
- informações copiadas manualmente
- ferramentas que não conversam
- respostas repetitivas
- leads sem acompanhamento
- site que não gera negócio
- processos dependentes de uma única pessoa

Esses elementos devem parecer situações reconhecíveis, não uma lista técnica de serviços.

Use interação sutil em hover/focus onde fizer sentido.

HOJE → OPERAÇÃO MELHOR

Implementar uma representação visual clara da transformação.

Exemplo conceitual:

Hoje:
Cliente → WhatsApp → pessoa → planilha → e-mail → sistema → pessoa

Com Atrium:
Cliente → jornada → regras/automação → integração → informação organizada → humano quando necessário

Essa composição deve ser visualmente forte e compreensível sem exigir texto técnico.

Em mobile, transformar naturalmente para fluxo vertical.

SOLUÇÕES

Apresentar as quatro ofertas oficiais:

- Sites & Experiências Digitais
- Automações & Integrações
- Sistemas sob Medida
- IA Aplicada

A seção não deve parecer uma grade genérica de cards de agência.

Cada solução deve conectar tecnologia a problema/resultado.

Evite listas extensas de stacks.

NÃO SABE DO QUE PRECISA?

Criar uma seção forte com a mensagem:

o cliente não precisa saber qual tecnologia contratar.

Ele precisa saber o que gostaria de melhorar.

CTA para /diagnostico.

CALCULADORA

Se o SDD prevê a calculadora já no M2, implementar somente a lógica local necessária para:

pessoas × minutos/dia × dias/semana × 4,33

Mostrar aproximadamente horas/mês.

Não enviar dados.

Não persistir dados.

Não integrar Supabase.

Não transformar automaticamente em valor financeiro.

Incluir o disclaimer definido no SDD sobre nem todo o tempo poder ser eliminado.

Caso o SDD determine que a lógica da calculadora pertence a milestone posterior, criar apenas a composição visual necessária e respeitar o SDD.

COMO TRABALHAMOS

Representar:

Entendemos → Desenhamos → Construímos → Evoluímos

A ideia de:

"começar pequeno, provar valor e escalar"

deve ficar clara.

Não fazer timeline SaaS genérica.

CASE CRED MARVI

Usar somente as informações permitidas no SDD.

Não inventar métricas.

Não inventar depoimentos.

Não inventar resultados comerciais.

Mostrar claramente:

Antes:
- contato via WhatsApp
- perguntas repetidas
- informação sem padrão
- descoberta manual do contexto

Depois:
- jornada estruturada
- perguntas condicionais
- informações organizadas
- consentimento
- handoff humano mais contextualizado

Tratar como primeiro caso Atrium.

SEGURANÇA E RESPONSABILIDADE

Apresentar segurança como parte da forma de construir, sem transformar a homepage em documentação técnica.

Comunicar:

- segurança desde o início
- privacidade
- minimização de dados
- rastreabilidade
- responsabilidade no uso de IA

Não colocar termos como SSRF, RLS, SBOM etc. na homepage.

FOUNDER

Criar bloco de autoridade discreto.

Utilizar a experiência profissional definida no SDD.

A função dessa seção é responder:

"Quem está por trás disso e por que eu deveria confiar?"

Não transformar em currículo.

Não criar parede de tecnologias.

Não utilizar logos de empresas anteriores.

FAQ

Implementar FAQ acessível.

Pode utilizar details/summary ou componente apropriado.

Garantir navegação por teclado e semântica correta.

Usar as perguntas e respostas do SDD.

CTA FINAL

A página deve terminar com uma pergunta forte, na direção definida no SDD:

"O que na sua empresa ainda deveria ser mais simples?"

CTA principal para Diagnóstico Atrium.

HEADER

Criar header final da homepage.

Deve ser:

- discreto
- premium
- responsivo
- acessível
- coerente com Atrium

Navegação:

Soluções
Como trabalhamos
Case
Sobre

CTA:
Diagnóstico gratuito

Links podem apontar para anchors ou futuras rotas conforme especificado no SDD.

No mobile, criar navegação adequada.

Não adicionar biblioteca pesada apenas para menu.

FOOTER

Criar footer final coerente com a identidade.

Não inventar redes sociais inexistentes.

Não inventar endereço físico.

Não inventar CNPJ.

Utilizar somente informações disponíveis no SDD.

MOTION

Utilizar motion somente onde agrega:

- entrada sutil de conteúdo
- transições
- transformação do fluxo
- microinterações

Evitar animações em todos os elementos.

Respeitar prefers-reduced-motion.

PERFORMANCE

Evitar assets pesados.

Não utilizar vídeos.

Não utilizar Three.js.

Não adicionar dependências sem necessidade concreta.

SVG e CSS são preferidos para diagramas.

RESPONSIVIDADE

Tratar mobile como experiência de primeira classe.

Validar no mínimo:

375px
768px
1440px
1920px

Especial atenção para:

- hero
- diagramas
- cards
- calculadora
- navegação
- CTA final

SEO

Implementar metadata apropriada para a homepage conforme SDD.

Ainda não implementar páginas SEO adicionais.

ACESSIBILIDADE

Manter os requisitos de M1.

Garantir:

- landmarks
- headings hierárquicos
- keyboard
- focus-visible
- contraste
- labels
- reduced motion
- semântica

TESTES

Adicionar testes úteis para comportamentos implementados neste milestone.

Não testar detalhes puramente visuais de implementação.

NÃO IMPLEMENTAR

Não implementar:

- Diagnostic Engine
- branching
- Opportunity Score
- Lead Score
- resultados do diagnóstico
- Supabase
- Edge Functions
- Turnstile
- persistência de lead
- WhatsApp builder
- páginas de solução completas
- página /sobre
- página detalhada do Cred Marvi
- autenticação
- CRM
- CMS
- LLM
- agentes
- multi-tenancy

Não crie APIs.

Não crie backend.

Não avance para M3.

VALIDAÇÃO

Ao terminar execute:

pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build

Confirme que:

- out/index.html existe
- homepage permanece compatível com static export
- nenhuma funcionalidade server-side foi introduzida

ENTREGA

Ao terminar apresente:

1. resumo da implementação;
2. arquivos criados;
3. arquivos modificados;
4. dependências adicionadas e justificativa;
5. estrutura final da homepage;
6. decisões visuais relevantes;
7. interações/motion implementados;
8. comportamento mobile;
9. acessibilidade;
10. testes;
11. resultados de format/lint/typecheck/test/build;
12. divergências do SDD, se houver;
13. confirmação explícita de que M3 e posteriores não foram implementados.

Não faça commit.

Pare após concluir M2.