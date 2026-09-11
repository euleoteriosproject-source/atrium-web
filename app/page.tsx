import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconBox } from "@/components/ui/icon-box";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TextLink } from "@/components/ui/text-link";

const colors = [
  { name: "Navy 950", value: "#0B1320", className: "bg-navy-950" },
  { name: "Navy 800", value: "#182638", className: "bg-navy-800" },
  { name: "Gold 500", value: "#D4AF37", className: "bg-gold-500" },
  { name: "Gold 300", value: "#E5C96A", className: "bg-gold-300" },
  { name: "Off-white", value: "#F8F7F3", className: "bg-offwhite" },
  { name: "Gray background", value: "#F2F3F5", className: "bg-gray-bg" },
  { name: "Gray text", value: "#566171", className: "bg-gray-text" },
] as const;

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Section background="dark" spacing="spacious">
          <Container>
            <Eyebrow tone="dark">M1 · Composição temporária</Eyebrow>
            <h1 className="mt-5 max-w-4xl text-display font-semibold">
              Sistema visual Atrium
            </h1>
            <p className="mt-7 max-w-2xl text-body-lg text-offwhite/70">
              Referência interna para validar tipografia, cores, componentes e
              estados antes da construção das páginas do produto.
            </p>
          </Container>
        </Section>

        <Section id="primitives">
          <Container>
            <SectionHeader
              eyebrow="Fundação"
              title="Tipografia e cor"
              description="Escala fluida, contraste calmo e dourado reservado aos pontos de ênfase."
            />

            <div className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-8">
                <div>
                  <p className="text-caption text-gray-text">Display</p>
                  <p className="text-display font-semibold">Aa</p>
                </div>
                <div>
                  <p className="text-caption text-gray-text">Heading 2</p>
                  <p className="text-h2 font-semibold">Forma com propósito.</p>
                </div>
                <div>
                  <p className="text-caption text-gray-text">Editorial serif</p>
                  <p className="mt-2 max-w-xl font-serif text-h3">
                    Clareza também é uma escolha de design.
                  </p>
                </div>
                <p className="max-w-xl text-body-lg text-gray-text">
                  Texto de corpo maior para introduções, com ritmo confortável e
                  leitura estável em telas pequenas ou amplas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                {colors.map((color) => (
                  <div
                    key={color.name}
                    className="overflow-hidden rounded-card border border-navy-950/10 bg-white"
                  >
                    <div className={`h-20 ${color.className}`} />
                    <div className="p-3">
                      <p className="text-body-sm font-semibold">{color.name}</p>
                      <p className="text-caption text-gray-text">
                        {color.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section background="muted">
          <Container>
            <SectionHeader
              eyebrow="Interação"
              title="Ações e superfícies"
              description="Estados previsíveis, foco visível e hierarquia sem excesso de efeito."
            />

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="text">Text action</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
              <LinkButton href="#forms">Link button</LinkButton>
              <TextLink href="#forms">Inline link</TextLink>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <IconBox>
                      <span className="size-2 bg-gold-500" />
                    </IconBox>
                    <Badge variant="accent">Accent</Badge>
                  </div>
                  <CardTitle>Superfície essencial</CardTitle>
                  <CardDescription>
                    Estrutura neutra para conteúdos que precisam de separação e
                    hierarquia.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-body-sm text-gray-text">
                    Sem linguagem visual específica de uma página futura.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge>Variação</Badge>
                  <CardTitle>Hierarquia discreta</CardTitle>
                  <CardDescription>
                    Elevação mínima e bordas contidas mantêm o conteúdo em
                    primeiro plano.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <TextLink href="#forms">Ver próximo grupo</TextLink>
                </CardFooter>
              </Card>

              <Card tone="dark">
                <CardHeader>
                  <Badge variant="dark">Dark</Badge>
                  <CardTitle>Contraste institucional</CardTitle>
                  <CardDescription tone="dark">
                    Alternativa escura para momentos de maior densidade visual.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Container>
        </Section>

        <Section id="forms">
          <Container>
            <SectionHeader
              eyebrow="Formulários"
              title="Campos preparados para uso real"
              description="Labels, descrições, erros e estados desabilitados fazem parte da API dos primitives."
            />

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <Input
                  label="Nome do campo"
                  description="Descrição opcional para orientar a resposta."
                  placeholder="Digite uma informação"
                />
                <Input
                  label="Campo com erro"
                  error="Revise esta informação antes de continuar."
                  defaultValue="Valor inválido"
                />
                <Select label="Seleção" defaultValue="">
                  <option value="" disabled>
                    Escolha uma opção
                  </option>
                  <option>Primeira opção</option>
                  <option>Segunda opção</option>
                </Select>
              </div>

              <div className="space-y-6">
                <Textarea
                  label="Mensagem"
                  description="Exemplo visual; nenhum dado será enviado."
                  placeholder="Descreva brevemente"
                />
                <Checkbox
                  label="Confirmo esta escolha"
                  description="O controle inteiro oferece uma área confortável para toque."
                />
                <Checkbox label="Opção indisponível" disabled />
                <Progress
                  label="Progresso de exemplo"
                  value={3}
                  max={5}
                  valueText="Etapa 3 de 5"
                />
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
