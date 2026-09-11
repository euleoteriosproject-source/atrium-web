import { Button } from "@/components/ui/button";

export function DiagnosticNavigation({
  canGoBack,
  onBack,
  onContinue,
  finalStep,
}: {
  canGoBack: boolean;
  onBack: () => void;
  onContinue: () => void;
  finalStep: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-navy-950/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {canGoBack ? (
        <Button variant="secondary" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Voltar
        </Button>
      ) : (
        <span />
      )}
      <Button onClick={onContinue}>
        {finalStep ? "Concluir" : "Continuar"}
        <span aria-hidden="true">→</span>
      </Button>
    </div>
  );
}
