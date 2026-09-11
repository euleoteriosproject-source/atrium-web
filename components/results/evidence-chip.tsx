import type { EvidenceItem } from "@/domain/diagnostic/evidence";

export function EvidenceChip({ evidence }: { evidence: EvidenceItem }) {
  return (
    <li className="inline-flex min-h-8 items-center border border-navy-950/12 bg-white px-3 py-1 text-caption font-semibold text-navy-800">
      {evidence.label}
    </li>
  );
}
