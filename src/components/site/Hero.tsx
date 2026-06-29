import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 lg:pt-48 lg:pb-32">
      <div className="absolute inset-0 bg-aurora" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <a
          href="#ai"
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Nouveau · Copilot IA pour managers OFM
          <span aria-hidden>→</span>
        </a>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight">
          L'OS qui propulse <br className="hidden sm:block" />
          les agences OFM <span className="text-gradient">au million</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
          De la première modèle au 7-figures mensuel. CRM, finance, recrutement, IA, automatisations —
          une seule plateforme, conçue par et pour les fondateurs d'agences.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3.5 text-base font-semibold text-primary-foreground glow-violet transition-all hover:scale-[1.03]"
          >
            Lancer mon agence
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#platform"
            className="inline-flex items-center gap-2 rounded-xl glass px-7 py-3.5 text-base font-medium text-foreground transition-all hover:bg-white/10"
          >
            <span className="grid place-items-center h-6 w-6 rounded-full bg-white/10">▶</span>
            Voir la démo
          </a>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          14 jours gratuits · Aucune carte bancaire · Onboarding IA personnalisé
        </p>

        {/* Floating preview card */}
        <div className="relative mx-auto mt-20 max-w-6xl">
          <div className="absolute -inset-x-10 -top-10 bottom-0 bg-aurora opacity-60 blur-3xl" aria-hidden />
          <div className="relative rounded-3xl border-gradient shadow-elevated overflow-hidden">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="bg-surface">
      {/* Window bar */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive/70" />
          <div className="h-3 w-3 rounded-full bg-chart-4/70" />
          <div className="h-3 w-3 rounded-full bg-chart-5/70" />
        </div>
        <div className="ml-4 text-xs text-muted-foreground font-mono">app.ofm-os.com / dashboard</div>
      </div>

      <div className="grid grid-cols-12 gap-0 min-h-[420px]">
        {/* Side */}
        <aside className="hidden md:flex col-span-2 flex-col gap-1 border-r border-border/60 p-3 bg-sidebar/60">
          {["Overview", "Modèles", "Chatters", "CRM", "Finance", "IA", "Recrutement"].map((l, i) => (
            <div
              key={l}
              className={`rounded-lg px-3 py-2 text-xs ${
                i === 0
                  ? "bg-primary/20 text-foreground border border-primary/30"
                  : "text-muted-foreground"
              }`}
            >
              {l}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="col-span-12 md:col-span-10 p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "MRR", value: "$487,210", delta: "+24.6%" },
              { label: "Modèles actives", value: "38", delta: "+6" },
              { label: "Conversion", value: "11.8%", delta: "+1.2pt" },
              { label: "Marge nette", value: "62%", delta: "+3pt" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl bg-surface-elevated border border-border/60 p-4 text-left">
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
                <div className="mt-2 font-display text-2xl font-semibold">{kpi.value}</div>
                <div className="mt-1 text-xs text-accent">{kpi.delta}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl bg-surface-elevated border border-border/60 p-5 text-left">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Revenus consolidés</div>
                <div className="text-xs text-muted-foreground">30 derniers jours</div>
              </div>
              <ChartMock />
            </div>
            <div className="rounded-xl bg-surface-elevated border border-border/60 p-5 text-left">
              <div className="text-sm font-medium">Copilot IA</div>
              <div className="mt-3 space-y-2 text-xs">
                {[
                  "Augmenter le prix du PPV de Luna à $42 (+18% projeté)",
                  "Relancer 12 fans VIP inactifs depuis 7 jours",
                  "Tester nouveau script de welcome pour Mia",
                ].map((s) => (
                  <div key={s} className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-foreground/90">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartMock() {
  const points = [10, 22, 18, 30, 28, 42, 38, 55, 50, 68, 62, 80, 76, 92];
  const max = Math.max(...points);
  const w = 100;
  const h = 40;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-32 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.27 295)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.62 0.27 295)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#ga)" />
      <path d={path} stroke="oklch(0.78 0.16 210)" strokeWidth="0.8" fill="none" />
    </svg>
  );
}
