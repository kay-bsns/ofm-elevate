const capabilities = [
  "Génération de scripts personnalisés par modèle et par fan",
  "Optimisation dynamique des prix PPV et abonnements",
  "Détection d'opportunités de revenu et de risque de churn",
  "Prévisions de revenus sur 30, 60, 90 jours",
  "Recommandations quotidiennes par rôle (founder, manager, chatter)",
  "Audit IA mensuel de l'agence avec plan d'action priorisé",
];

export function AiSection() {
  return (
    <section id="ai" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-aurora opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-semibold tracking-widest text-accent uppercase">Intelligence</div>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
              Un copilote IA <span className="text-gradient">dans chaque décision</span>.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              OFM OS combine les meilleurs modèles génératifs avec votre data agence pour produire des recommandations actionnables, pas des chatbots génériques.
            </p>
            <ul className="mt-8 space-y-3">
              {capabilities.map((c) => (
                <li key={c} className="flex gap-3">
                  <span className="mt-1 grid place-items-center h-5 w-5 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold">✓</span>
                  <span className="text-foreground/90">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-3xl glass shadow-elevated p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> Copilot · session live
              </div>
              {[
                { role: "user", text: "Que faire pour augmenter le revenu de Luna ce mois ?" },
                {
                  role: "ai",
                  text:
                    "3 actions à fort impact : 1) Pousser un PPV exclusif à $48 sur les 142 fans VIP (+$5.2k projeté). 2) Activer la séquence de re-engagement pour les 38 inactifs >14j. 3) Tester un bundle weekend (+22% AOV sur le segment).",
                },
                { role: "user", text: "Génère le script du PPV" },
                {
                  role: "ai",
                  text:
                    "✦ Script prêt en 3 variantes (teasing, urgence, exclusivité) — adapté au ton de Luna. Tu veux que je le pousse aux chatters ?",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-surface-elevated border border-border/60"
                      : "bg-gradient-primary text-primary-foreground glow-violet"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-surface-elevated border border-border/60 px-3 py-2.5">
                <input
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Demande à ton copilote…"
                  readOnly
                />
                <button className="rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
