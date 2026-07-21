import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · OFM OS" },
      { name: "description", content: "Cohortes, funnels et rétention pour optimiser les revenus." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <ModulePage
      eyebrow="Business"
      title="Analytics avancés"
      description="Cohortes, funnels, rétention et attribution — le moteur analytique de votre agence."
      features={[
        { icon: "◎", title: "Cohortes", desc: "Rétention et LTV par mois d'acquisition et par source." },
        { icon: "◈", title: "Funnels", desc: "Follow → sub → PPV → tip → renouvellement." },
        { icon: "✦", title: "Attribution", desc: "Contribution de chaque canal, chatter et campagne." },
      ]}
    />
  );
}
