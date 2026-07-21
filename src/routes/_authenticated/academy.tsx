import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/academy")({
  head: () => ({
    meta: [
      { title: "Académie · OFM OS" },
      { name: "description", content: "Formation continue des chatters et managers de votre agence OFM." },
    ],
  }),
  component: AcademyPage,
});

function AcademyPage() {
  return (
    <ModulePage
      eyebrow="Croissance"
      title="Académie OFM"
      description="Formez vos équipes en continu avec des parcours certifiants, quiz et coaching IA."
      features={[
        { icon: "✺", title: "Parcours", desc: "Cursus chatter, closer, manager, growth — certifiants." },
        { icon: "◎", title: "Quiz & scoring", desc: "Évaluations régulières avec badges et niveaux." },
        { icon: "✦", title: "Coach IA", desc: "Feedback personnalisé sur les conversations réelles." },
      ]}
    />
  );
}
