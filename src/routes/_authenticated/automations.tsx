import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/automations")({
  head: () => ({
    meta: [
      { title: "Automatisations · OFM OS" },
      { name: "description", content: "Workflows sans code pour automatiser tous les processus de l'agence." },
    ],
  }),
  component: AutomationsPage,
});

function AutomationsPage() {
  return (
    <ModulePage
      eyebrow="Croissance"
      title="Automatisations"
      description="Automatisez tous vos processus récurrents avec un moteur de workflows visuels sans code."
      features={[
        { icon: "⌘", title: "Workflows visuels", desc: "Triggers, conditions et actions en drag & drop." },
        { icon: "◆", title: "Recettes prêtes", desc: "Bibliothèque de recettes optimisées pour OFM." },
        { icon: "✦", title: "IA intégrée", desc: "Étapes IA (classification, génération, décision) intégrées." },
      ]}
    />
  );
}
