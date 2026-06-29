import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Modules } from "@/components/site/Modules";
import { AiSection } from "@/components/site/AiSection";
import { Pricing } from "@/components/site/Pricing";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OFM OS — L'OS des agences OnlyFans au million" },
      {
        name: "description",
        content:
          "La plateforme tout-en-un pour lancer, gérer et scaler une agence OFM. CRM, finance, IA, recrutement et automatisations.",
      },
      { property: "og:title", content: "OFM OS — L'OS des agences OnlyFans" },
      {
        property: "og:description",
        content: "Lancez et scalez votre agence OFM au million avec l'IA et l'automatisation.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      <Nav />
      <Hero />
      <Stats />
      <div id="platform" />
      <Modules />
      <AiSection />
      <div id="academy" />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
