import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "Finance · OFM OS" },
      { name: "description", content: "Revenus, virements, commissions et prévisions financières de l'agence." },
    ],
  }),
  component: FinancePage,
});

function FinancePage() {
  return (
    <ModulePage
      eyebrow="Business"
      title="Finance"
      description="Vision consolidée du cash-flow, des revenus par modèle, des commissions et des virements."
      features={[
        { icon: "$", title: "Cash-flow", desc: "Encaissements OF, virements bancaires et solde disponible." },
        { icon: "◎", title: "P&L par modèle", desc: "Marge nette après commissions, chatters et frais." },
        { icon: "✦", title: "Forecast IA", desc: "Prévisions revenus 30/60/90 jours par modèle." },
      ]}
    />
  );
}
