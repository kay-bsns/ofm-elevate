import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/copilot")({
  head: () => ({
    meta: [
      { title: "Copilot IA · OFM OS" },
      { name: "description", content: "Copilote IA global : brief matinal, décisions et exécution." },
    ],
  }),
  component: CopilotPage,
});

function CopilotPage() {
  return (
    <ModulePage
      eyebrow="Croissance"
      title="Copilot IA"
      description="Votre copilote IA global : brief matinal, recommandations chiffrées, actions en un clic sur toute l'agence."
      features={[
        { icon: "✦", title: "Brief quotidien", desc: "Top 3 priorités, alertes et opportunités du jour." },
        { icon: "◈", title: "Décisions chiffrées", desc: "Chaque recommandation vient avec un impact projeté." },
        { icon: "⌘", title: "Exécution 1-clic", desc: "Appliquez la recommandation, le système déclenche les actions." },
      ]}
    />
  );
}
