import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";

export const Route = createFileRoute("/_authenticated/contracts")({
  head: () => ({
    meta: [
      { title: "Contrats · OFM OS" },
      { name: "description", content: "Contrats modèles et chatters, signature électronique et archivage." },
    ],
  }),
  component: ContractsPage,
});

function ContractsPage() {
  return (
    <ModulePage
      eyebrow="Business"
      title="Contrats"
      description="Générez, signez et archivez tous les contrats modèles, chatters et prestataires."
      features={[
        { icon: "❖", title: "Templates", desc: "Contrats types multi-juridictions personnalisables." },
        { icon: "✎", title: "Signature électronique", desc: "Signature légale intégrée, envoi et rappels automatiques." },
        { icon: "◈", title: "Coffre-fort", desc: "Archivage sécurisé, chiffré et versionné." },
      ]}
    />
  );
}
