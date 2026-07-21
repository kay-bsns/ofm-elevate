import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox · OFM OS" },
      { name: "description", content: "Boîte de réception unifiée pour toutes vos conversations OFM." },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  return (
    <ModulePage
      eyebrow="Workspace"
      title="Inbox unifiée"
      description="Centralisez toutes les conversations de toutes vos modèles dans une seule boîte de réception intelligente."
      features={[
        { icon: "✉", title: "Multi-comptes", desc: "Connectez plusieurs comptes OnlyFans et gérez-les depuis une seule vue." },
        { icon: "◈", title: "Filtres intelligents", desc: "Priorisez automatiquement whales, VIP et fans à réactiver." },
        { icon: "✦", title: "Réponses IA", desc: "Suggestions contextuelles avec l'historique complet du fan." },
      ]}
    />
  );
}
