import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/managers")({
  head: () => ({
    meta: [
      { title: "Managers · OFM OS" },
      { name: "description", content: "Managers : supervision des équipes et pilotage des modèles." },
    ],
  }),
  component: ManagersPage,
});

function ManagersPage() {
  return (
    <ModulePage
      eyebrow="Opérations"
      title="Managers & Superviseurs"
      description="Attribuez des managers à vos modèles, suivez leur portefeuille et leurs performances."
      features={[
        { icon: "◆", title: "Portefeuille", desc: "Modèles pilotées et chatters supervisés." },
        { icon: "◎", title: "KPI équipe", desc: "Revenu total, croissance et alertes de churn." },
        { icon: "⌘", title: "Escalades", desc: "Traitement des demandes fans et incidents." },
      ]}
    />
  );
}
