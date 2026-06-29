import { createFileRoute, Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · OFM OS" },
      { name: "description", content: "Pilotez votre agence OFM en temps réel." },
    ],
  }),
  component: DashboardPage,
});

const kpis = [
  { label: "MRR", value: "$487,210", delta: "+24.6%", positive: true },
  { label: "Revenus 30j", value: "$1.42M", delta: "+18.2%", positive: true },
  { label: "Modèles actives", value: "38", delta: "+6", positive: true },
  { label: "Marge nette", value: "62%", delta: "+3pt", positive: true },
];

const topModels = [
  { name: "Luna", revenue: "$84,210", growth: "+32%", chatters: 4 },
  { name: "Mia", revenue: "$67,540", growth: "+21%", chatters: 3 },
  { name: "Aria", revenue: "$52,180", growth: "+14%", chatters: 2 },
  { name: "Sienna", revenue: "$41,920", growth: "+9%", chatters: 2 },
  { name: "Nova", revenue: "$38,470", growth: "+45%", chatters: 2 },
];

const aiActions = [
  { title: "Augmenter PPV Luna à $48", impact: "+$5.2k projeté", tag: "Prix" },
  { title: "Relancer 38 fans VIP inactifs", impact: "+$3.1k projeté", tag: "Retention" },
  { title: "Recruter 2 chatters pour Mia", impact: "Capacity +35%", tag: "Équipe" },
  { title: "Lancer bundle weekend Nova", impact: "+22% AOV", tag: "Campagne" },
];

function DashboardPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="p-6 lg:p-8 space-y-8 max-w-[1600px]">
          <Header />
          <KpiGrid />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <RevenueChart />
            <Copilot />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TopModels />
            <AiActions />
          </div>
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 rounded-xl bg-surface border border-border/60 px-3 py-2">
            <span className="text-muted-foreground">⌕</span>
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Rechercher modèle, chatter, transaction… (⌘K)"
            />
            <kbd className="hidden sm:inline rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
          </div>
        </div>
        <button className="rounded-lg glass border border-border/60 px-3 py-2 text-sm hover:bg-white/10 transition">
          ✦ Copilot
        </button>
        <button className="relative rounded-lg glass border border-border/60 p-2 hover:bg-white/10 transition">
          <span>🔔</span>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
          A
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div>
        <div className="text-sm text-muted-foreground">Bienvenue, Alex 👋</div>
        <h1 className="mt-1 font-display text-3xl lg:text-4xl font-bold tracking-tight">
          Votre agence sur la route du <span className="text-gradient">million</span>.
        </h1>
      </div>
      <div className="flex gap-2">
        <Link
          to="/"
          className="rounded-xl glass border border-border/60 px-4 py-2 text-sm hover:bg-white/10 transition"
        >
          Voir le site
        </Link>
        <button className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-violet">
          + Nouvelle action
        </button>
      </div>
    </div>
  );
}

function KpiGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-2xl bg-surface border border-border/60 p-5 shadow-card">
          <div className="text-xs text-muted-foreground">{k.label}</div>
          <div className="mt-2 font-display text-3xl font-semibold">{k.value}</div>
          <div className={`mt-2 text-xs ${k.positive ? "text-accent" : "text-destructive"}`}>
            {k.delta} vs mois dernier
          </div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart() {
  const data = [22, 28, 35, 32, 48, 44, 60, 56, 72, 68, 85, 80, 95, 102, 118, 110, 132, 128, 145, 158];
  const max = Math.max(...data);
  const w = 600;
  const h = 200;
  const path = data
    .map((p, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (p / max) * h * 0.9 - 10;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <div className="xl:col-span-2 rounded-2xl bg-surface border border-border/60 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-semibold">Revenus consolidés</div>
          <div className="text-xs text-muted-foreground">Toutes modèles · 30 derniers jours</div>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
          {["7j", "30j", "90j", "1y"].map((p, i) => (
            <button
              key={p}
              className={`px-3 py-1 rounded-md transition ${
                i === 1 ? "bg-background text-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-6 h-56 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.27 295)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="oklch(0.62 0.27 295)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="revstroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.62 0.27 295)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 210)" />
          </linearGradient>
        </defs>
        <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#rev)" />
        <path d={path} stroke="url(#revstroke)" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

function Copilot() {
  return (
    <div className="rounded-2xl border-gradient p-6 shadow-card flex flex-col">
      <div className="flex items-center gap-2">
        <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-primary text-primary-foreground glow-violet">
          ✦
        </div>
        <div>
          <div className="font-display text-base font-semibold">Copilot IA</div>
          <div className="text-[11px] text-muted-foreground">Recommandations du jour</div>
        </div>
      </div>
      <div className="mt-5 space-y-2.5 flex-1">
        {aiActions.slice(0, 3).map((a) => (
          <div key={a.title} className="rounded-xl bg-surface-elevated border border-border/60 p-3">
            <div className="text-xs text-accent">{a.tag} · {a.impact}</div>
            <div className="mt-1 text-sm font-medium">{a.title}</div>
          </div>
        ))}
      </div>
      <button className="mt-5 rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground">
        Ouvrir le copilote
      </button>
    </div>
  );
}

function TopModels() {
  return (
    <div className="rounded-2xl bg-surface border border-border/60 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="font-display text-lg font-semibold">Top modèles</div>
        <button className="text-xs text-muted-foreground hover:text-foreground">Voir tout →</button>
      </div>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground text-left">
            <th className="font-medium py-2">Modèle</th>
            <th className="font-medium py-2">Revenus 30j</th>
            <th className="font-medium py-2">Évolution</th>
            <th className="font-medium py-2">Équipe</th>
          </tr>
        </thead>
        <tbody>
          {topModels.map((m) => (
            <tr key={m.name} className="border-t border-border/60">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold text-primary-foreground">
                    {m.name[0]}
                  </div>
                  <span className="font-medium">{m.name}</span>
                </div>
              </td>
              <td className="py-3 font-mono">{m.revenue}</td>
              <td className="py-3 text-accent">{m.growth}</td>
              <td className="py-3 text-muted-foreground">{m.chatters} chatters</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AiActions() {
  return (
    <div className="rounded-2xl bg-surface border border-border/60 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="font-display text-lg font-semibold">Plan d'action IA</div>
        <span className="text-xs rounded-full bg-primary/15 text-primary px-2 py-1">4 actions</span>
      </div>
      <div className="mt-4 space-y-3">
        {aiActions.map((a) => (
          <div
            key={a.title}
            className="group flex items-start gap-3 rounded-xl bg-surface-elevated border border-border/60 p-4 hover:border-primary/40 transition"
          >
            <div className="mt-0.5 grid place-items-center h-8 w-8 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
              ✦
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.tag} · {a.impact}</div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition text-xs rounded-lg bg-gradient-primary px-3 py-1.5 text-primary-foreground font-medium">
              Exécuter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
