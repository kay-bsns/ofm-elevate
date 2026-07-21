import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/commissions")({
  head: () => ({
    meta: [
      { title: "Commissions · OFM OS" },
      { name: "description", content: "Grilles de commissions par rôle, calcul automatique et paie." },
    ],
  }),
  component: CommissionsPage,
});

function CommissionsPage() {
  return (
    <ModulePage
      eyebrow="Business"
      title="Commissions"
      description="Configurez les grilles de commissions par rôle, palier et objectif, avec calcul et paie automatiques."
      features={[
        { icon: "%", title: "Grilles multi-paliers", desc: "Par modèle, par chatter, par volume ou par mois." },
        { icon: "◎", title: "Calcul automatique", desc: "Recalculé à chaque interaction enregistrée." },
        { icon: "$", title: "Paie & exports", desc: "Bordereaux PDF, virements SEPA et exports comptables." },
      ]}
    />
  );
}
