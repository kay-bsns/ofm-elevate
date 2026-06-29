import { Link } from "@tanstack/react-router";

export function CTA() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border-gradient p-12 lg:p-20 text-center shadow-elevated">
          <div className="absolute inset-0 bg-aurora opacity-70" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Votre prochaine agence <br className="hidden sm:block" />
              <span className="text-gradient">à 7 chiffres commence ici.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              Rejoignez les 1 200+ agences qui scalent avec OFM OS. Onboarding IA en 5 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3.5 text-base font-semibold text-primary-foreground glow-violet transition-all hover:scale-[1.03]"
              >
                Démarrer gratuitement →
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl glass px-7 py-3.5 text-base font-medium text-foreground hover:bg-white/10 transition-all"
              >
                Voir les tarifs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
