import { Link } from "@tanstack/react-router";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/ 14 jours",
    desc: "Découvrez la plateforme et l'IA copilote.",
    features: ["1 modèle", "1 utilisateur", "CRM + Finance basique", "Copilot IA limité"],
    cta: "Essayer gratuitement",
    featured: false,
  },
  {
    name: "Agency",
    price: "$249",
    period: "/ mois",
    desc: "L'OS complet pour les agences en croissance.",
    features: [
      "Jusqu'à 25 modèles",
      "Équipe illimitée",
      "Tous les modules",
      "Copilot IA illimité",
      "Recrutement automatisé",
      "Académie & marketplace",
    ],
    cta: "Démarrer Agency",
    featured: true,
  },
  {
    name: "Scale",
    price: "Sur devis",
    period: "",
    desc: "Pour les agences 7-figures et au-delà.",
    features: [
      "Modèles illimités",
      "Multi-agences / white-label",
      "SSO, audit logs, SLA",
      "IA fine-tunée sur vos data",
      "Account manager dédié",
    ],
    cta: "Parler à un expert",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold tracking-widest text-accent uppercase">Tarifs</div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Un prix qui <span className="text-gradient">scale avec vous</span>.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Sans engagement. Annulez ou changez de plan à tout moment.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-7 flex flex-col ${
                p.featured
                  ? "border-gradient shadow-elevated glow-violet"
                  : "bg-surface border border-border/60"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Recommandé
                </div>
              )}
              <div className="font-display text-xl font-semibold">{p.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm">
                    <span className="mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={`mt-8 inline-flex justify-center items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  p.featured
                    ? "bg-gradient-primary text-primary-foreground hover:scale-[1.03]"
                    : "bg-white/5 hover:bg-white/10 text-foreground border border-border/60"
                }`}
              >
                {p.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
