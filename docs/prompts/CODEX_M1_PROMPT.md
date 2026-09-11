Leia integralmente antes de modificar qualquer arquivo:

* `docs/ATRIUM_WEB_MVP_SDD.md`
* todo o código atualmente existente no repositório

O `ATRIUM_WEB_MVP_SDD.md` continua sendo a fonte da verdade do produto.

O M0 foi concluído e aprovado.

Sua tarefa agora é implementar exclusivamente:

# M1 — DESIGN SYSTEM

Não implemente M2 ou qualquer milestone posterior.

## Objetivo

Criar a fundação visual e os componentes reutilizáveis do Atrium Web MVP, respeitando rigorosamente a identidade definida no SDD.

O resultado deve transmitir:

* sofisticação;
* confiança;
* maturidade;
* precisão;
* tecnologia aplicada;
* discrição;
* sensação premium.

A interface NÃO deve parecer:

* startup genérica de IA;
* agência digital;
* fintech genérica;
* template SaaS;
* cyberpunk;
* futurismo exagerado.

## Identidade visual obrigatória

Use como base os tokens definidos no SDD:

* Navy principal: `#0B1320`
* Navy secundário: `#182638`
* Dourado principal: `#D4AF37`
* Dourado suave: `#E5C96A`
* Off-white: `#F8F7F3`
* Fundo claro: `#F2F3F5`
* Texto secundário: `#566171`

O dourado deve funcionar como detalhe de destaque e não como cor dominante.

Evite gradientes desnecessários.

Não use neon.

Não use efeitos glow exagerados.

Não use glassmorphism como linguagem principal.

Não use sombras pesadas.

A sensação premium deve vir principalmente de:

* tipografia;
* proporção;
* espaço;
* contraste;
* ritmo;
* hierarquia;
* motion sutil.

## Tipografia

Configure a tipografia definida no SDD.

Preferência:

* UI / corpo / headings principais: Manrope
* serif editorial para momentos específicos: Source Serif 4

Use fontes por meio da estratégia recomendada pelo Next.js para que sejam otimizadas no build.

Não use serif indiscriminadamente.

Crie uma escala tipográfica consistente para:

* display;
* h1;
* h2;
* h3;
* h4;
* body-lg;
* body;
* body-sm;
* caption;
* eyebrow/label.

Evite tamanhos hardcoded espalhados pelos componentes.

## Layout

Criar primitives reutilizáveis para:

* `Container`
* `Section`
* layout/grid helpers somente quando agregarem valor

Referência:

* desktop: grid conceitual de 12 colunas;
* mobile: 4 colunas;
* container máximo aproximadamente 1200–1280px;
* gutters responsivos;
* espaçamento vertical generoso.

Não introduza abstrações complexas sem uso real.

## Componentes UI

Criar no mínimo os componentes reutilizáveis necessários para o projeto:

### Button

Variantes necessárias:

* primary
* secondary
* ghost
* text/link style, caso faça sentido arquiteturalmente

Tamanhos consistentes.

Estados:

* default
* hover
* focus-visible
* disabled
* loading, se o SDD justificar sua presença futura

Primary deve transmitir Atrium, não parecer botão padrão do Tailwind.

### Link

Tratamento consistente para:

* links normais;
* links de navegação;
* links inline.

### Eyebrow / Label

Para pequenos indicadores acima de headings.

### Card

Primitive suficientemente simples para ser reutilizada posteriormente.

Não crie ainda cards específicos da homepage.

### Form primitives

Preparar componentes acessíveis para o diagnóstico futuro:

* Input
* Textarea
* Select
* Checkbox

Estados:

* normal
* focus
* disabled
* error

Todos precisam de foco de teclado claramente visível.

### Progress

Criar primitive de progresso que possa ser usado posteriormente no Diagnóstico Atrium.

Não implementar lógica de diagnóstico.

### Divider / Separator

Somente se realmente útil.

## Ícones

Escolha uma biblioteca leve e apropriada somente se houver necessidade real durante M1.

Se Lucide for utilizada, importe ícones individualmente.

Não adicionar bibliotecas de ícones redundantes.

## Motion

Adicionar a dependência de motion somente se estiver prevista pelo SDD e houver uso concreto no M1.

Criar princípios reutilizáveis para animação.

Movimentos devem ser:

* discretos;
* rápidos;
* elegantes;
* funcionais.

Use aproximadamente a faixa já definida no SDD de 180–450ms quando apropriado.

Respeitar obrigatoriamente:

`prefers-reduced-motion`

Não adicionar animações decorativas pesadas.

## Responsividade

Os componentes precisam ser mobile-first.

Testar no mínimo conceitualmente:

* mobile estreito;
* mobile padrão;
* tablet;
* desktop;
* desktop largo.

Evitar medidas que funcionem apenas no monitor do desenvolvedor.

## Acessibilidade

Obrigatório:

* HTML semântico;
* contraste adequado;
* foco visível;
* teclado;
* labels corretas;
* `aria-*` somente onde necessário;
* estados disabled corretos;
* reduced motion.

Não remover outline sem substituição acessível.

## Tailwind

Centralize tokens e padrões.

Evite classes arbitrárias repetidas.

Não transforme o design system em uma camada gigantesca de abstração.

Prefira componentes pequenos, claros e previsíveis.

## Página inicial durante M1

Não implemente a homepage real.

A rota `/` pode servir apenas como uma composição mínima para validar visualmente os primitives do design system durante este milestone.

Ela pode conter exemplos controlados de:

* tipografia;
* botões;
* cards;
* campos;
* cores;
* estados.

Essa composição é temporária e será substituída no M2.

Não escreva copy definitiva da homepage agora.

Não antecipe seções do M2.

## Não implementar neste milestone

Explicitamente proibido implementar:

* homepage final;
* hero definitivo;
* pain recognition;
* calculadora;
* diagnóstico;
* scoring;
* resultado;
* WhatsApp;
* Supabase;
* Edge Functions;
* Turnstile;
* case Cred Marvi;
* páginas de solução;
* página Sobre;
* analytics;
* integrações;
* IA;
* autenticação;
* CMS.

## Qualidade de código

Manter:

* TypeScript estrito;
* componentes tipados;
* API simples;
* nomes claros;
* sem `any` desnecessário;
* sem duplicação evitável;
* sem overengineering.

Adicione testes úteis para os primitives onde fizer sentido.

Não crie testes simplesmente para aumentar contagem.

## Validação obrigatória

Ao concluir M1, execute:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Todos devem passar.

Confirme novamente que `out/index.html` continua sendo gerado.

## Entrega final

Ao concluir, responda com:

1. resumo do que foi implementado;
2. arquivos criados;
3. arquivos modificados;
4. dependências adicionadas e justificativa;
5. decisões visuais relevantes;
6. componentes disponíveis;
7. comportamento responsivo;
8. tratamento de acessibilidade;
9. tratamento de `prefers-reduced-motion`;
10. resultado de:

* format
* lint
* typecheck
* tests
* build;

11. qualquer divergência encontrada em relação ao SDD;
12. confirmação explícita de que nenhuma funcionalidade de M2 ou posterior foi implementada.

Não faça commit.

Não avance para M2.

Pare após entregar o relatório de M1.
