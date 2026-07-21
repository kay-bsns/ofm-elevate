import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendrier · OFM OS" },
      { name: "description", content: "Planning éditorial et shifts chatters pour votre agence OFM." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <ModulePage
      eyebrow="Workspace"
      title="Calendrier & Planning"
      description="Planifiez les posts, campagnes PPV et shifts chatters de toute l'agence sur une timeline unifiée."
      features={[
        { icon: "◷", title: "Planning éditorial", desc: "Posts, stories et PPV programmés par modèle." },
        { icon: "◐", title: "Shifts chatters", desc: "Rotation 24/7 avec couverture par fuseau horaire." },
        { icon: "★", title: "Campagnes", desc: "Lancements coordonnés multi-modèles et A/B testing." },
      ]}
    />
  );
}
