import { Suspense } from "react";

import { AdminLeadDetailView } from "@/components/admin/admin-lead-detail";

export default function AdminLeadPage() {
  return (
    <Suspense fallback={<p className="p-8 text-gray-text">Carregando lead…</p>}>
      <AdminLeadDetailView />
    </Suspense>
  );
}
