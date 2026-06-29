const modules = [
  {
    title: "CRM Modèles & Chatters",
    desc: "Pipeline unifié, scoring IA, historique des conversations, KPIs par modèle et par chatter.",
    icon: "◐",
  },
  {
    title: "Finance & Commissions",
    desc: "P&L temps réel, splits automatiques, facturation, paiements multi-devises, prévisionnel IA.",
    icon: "◈",
  },
  {
    title: "Recrutement automatisé",
    desc: "Sourcing IA de modèles, chatters et VA, screening, scoring, entretiens et onboarding intégrés.",
    icon: "◇",
  },
  {
    title: "Copilot IA omniprésent",
    desc: "Scripts, prix, campagnes, réponses, stratégies — un copilote contextuel sur chaque écran.",
    icon: "✦",
  },
  {
    title: "Centre d'automatisation",
    desc: "Connectez Slack, Telegram, Stripe, Notion, Google, Make, n8n via webhooks et déclencheurs.",
    icon: "⌘",
  },
  {
    title: "Académie & Communauté",
    desc: "Formations, SOPs, templates, marketplace, classements, défis et certifications.",
    icon: "✺",
  },
  {
    title: "Contrats & Signature",
    desc: "Modèles juridiques, signature électronique, coffre documentaire, vérification d'identité.",
    icon: "❖",
  },
  {
    title: "Analytics temps réel",
    desc: "Dashboards modulables, alertes intelligentes, détection d'anomalies, prévisions sur 90 jours.",
    icon: "◉",
  },
];

export function Modules() {
  return (
    <section id="modules" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold tracking-widest text-accent uppercase">Modules</div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Tout ce qu'il faut pour <span className="text-gradient">scaler une agence</span>, dans un seul OS.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Modulaire, brandable, multi-équipes, multi-pays. Activez les modules dont vous avez besoin et laissez l'IA orchestrer le reste.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <div
              key={m.title}
              className="group relative rounded-2xl bg-surface border border-border/60 p-6 transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative">
                <div className="inline-grid place-items-center h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground text-lg font-bold glow-violet">
                  {m.icon}
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
