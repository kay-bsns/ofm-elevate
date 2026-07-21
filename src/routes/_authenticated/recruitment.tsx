import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/recruitment")({
  head: () => ({
    meta: [
      { title: "Recrutement · OFM OS" },
      { name: "description", content: "Sourcing IA de modèles et chatters : pipeline, entretiens, onboarding." },
    ],
  }),
  component: RecruitmentPage,
});

function RecruitmentPage() {
  return (
    <ModulePage
      eyebrow="Croissance"
      title="Recrutement automatisé"
      description="Sourcing IA de modèles et de chatters, entretiens automatisés et onboarding structuré."
      features={[
        { icon: "◇", title: "Sourcing IA", desc: "Scraping éthique et scoring des profils Instagram/TikTok." },
        { icon: "✉", title: "Outreach", desc: "Séquences multi-canaux personnalisées et A/B testées." },
        { icon: "✺", title: "Onboarding", desc: "Parcours guidé : contrat, formation, mise en production." },
      ]}
    />
  );
}
