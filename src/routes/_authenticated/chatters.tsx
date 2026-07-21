import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/chatters")({
  head: () => ({
    meta: [
      { title: "Chatters · OFM OS" },
      { name: "description", content: "Gestion de votre équipe de chatters : shifts, performance, commissions." },
    ],
  }),
  component: ChattersPage,
});

function ChattersPage() {
  return (
    <ModulePage
      eyebrow="Opérations"
      title="Équipe Chatters"
      description="Gérez votre équipe de chatters, leurs shifts, leur performance et leurs commissions en temps réel."
      features={[
        { icon: "◐", title: "Roster", desc: "Profils, langues, spécialités et modèles assignés." },
        { icon: "◎", title: "Performance", desc: "Revenus générés, taux de conversion PPV et LTV par chatter." },
        { icon: "%", title: "Commissions auto", desc: "Calcul automatique selon la grille et les objectifs." },
      ]}
    />
  );
}
