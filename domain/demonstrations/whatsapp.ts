export type DemonstrationWhatsAppInput = Readonly<{
  name: string;
  companyName: string;
  demonstrationName: string;
}>;

export function buildDemonstrationWhatsAppMessage(
  input: DemonstrationWhatsAppInput,
) {
  return [
    "Olá! Vi a demonstração Auto Center da Atrium e gostaria de conversar sobre uma implementação para minha empresa.",
    "",
    `Nome: ${input.name.trim()}`,
    `Empresa: ${input.companyName.trim()}`,
    `Demonstração: ${input.demonstrationName}`,
    "",
    "Gostaria de entender como essa experiência poderia ser adaptada ao meu negócio.",
  ].join("\n");
}

export function buildDemonstrationWhatsAppUrl(
  whatsappNumber: string,
  input: DemonstrationWhatsAppInput,
) {
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;

  return `https://wa.me/${digits}?text=${encodeURIComponent(
    buildDemonstrationWhatsAppMessage(input),
  )}`;
}
