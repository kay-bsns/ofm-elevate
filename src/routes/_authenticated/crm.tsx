import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { crmDashboard } from "@/lib/crm.functions";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/crm")({
  head: () => ({ meta: [{ title: "CRM Dashboard · OFM OS" }] }),
  component: CrmDashboardPage,
});

const STATUS_LABELS: Record<string, string> = {
  lead: "Nouveau", active: "Actif", vip: "VIP", whale: "Whale", churned: "Churn",
};
const STATUS_COLORS: Record<string, string> = {
  lead: "bg-white/10 text-muted-foreground",
  active: "bg-emerald-500/20 text-emerald-300",
  vip: "bg-primary/20 text-primary",
  whale: "bg-accent/20 text-accent",
  churned: "bg-destructive/20 text-destructive",
};

function CrmDashboardPage() {
  const fn = useServerFn(crmDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["crm-dashboard"],
    queryFn: () => fn(),
  });

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">CRM</div>
            <h1 className="text-2xl font-semibold">Dashboard KPI</h1>
            <p className="text-sm text-muted-foreground">Vue consolidée de tous les fans de l'agence.</p>
          </div>
          <Link to="/models" className="text-sm text-accent hover:underline">Voir les modèles →</Link>
        </div>

        {isLoading || !data ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Kpi label="Revenu total" value={`$${data.totals.totalRevenue.toFixed(0)}`} accent />
              <Kpi label="LTV moyenne" value={`$${data.totals.avgLtv.toFixed(0)}`} />
              <Kpi label="Fans actifs" value={data.totals.activeFans.toString()} sub={`sur ${data.totals.totalFans}`} />
              <Kpi label="Taux de conversion" value={`${data.totals.conversionRate.toFixed(1)}%`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Revenu — 30 j</div>
                    <div className="text-lg font-semibold">
                      ${data.trend.reduce((s, d) => s + d.revenue, 0).toFixed(0)}
                    </div>
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Revenu"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Répartition par statut</div>
                <div className="space-y-3">
                  {Object.entries(data.byStatus).map(([s, v]) => {
                    const pct = data.totals.totalFans > 0 ? (v.count / data.totals.totalFans) * 100 : 0;
                    return (
                      <div key={s}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${STATUS_COLORS[s]}`}>
                            {STATUS_LABELS[s]}
                          </span>
                          <span className="text-muted-foreground">{v.count} · ${v.ltv.toFixed(0)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top 10 fans</div>
              </div>
              {data.topFans.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Aucun fan enregistré.</div>
              ) : (
                <div className="divide-y divide-border/40">
                  {data.topFans.map((f: any, idx: number) => (
                    <Link
                      key={f.id}
                      to="/models/$modelId"
                      params={{ modelId: f.model_id }}
                      className="grid grid-cols-12 gap-2 items-center px-5 py-3 text-sm hover:bg-white/5"
                    >
                      <div className="col-span-1 text-muted-foreground text-xs">#{idx + 1}</div>
                      <div className="col-span-5">
                        <div className="font-medium">@{f.handle}</div>
                        <div className="text-[11px] text-muted-foreground">{f.display_name || "—"}</div>
                      </div>
                      <div className="col-span-3 text-xs text-muted-foreground">{f.models?.stage_name ?? "—"}</div>
                      <div className="col-span-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${STATUS_COLORS[f.status]}`}>
                          {STATUS_LABELS[f.status]}
                        </span>
                      </div>
                      <div className="col-span-1 text-right font-mono text-accent">${Number(f.lifetime_value).toFixed(0)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/40"}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
