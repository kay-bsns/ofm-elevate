import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface ModulePageProps {
  eyebrow: string;
  title: string;
  description: string;
  cta?: { label: string; href?: string; onClick?: () => void };
  features: { title: string; desc: string; icon?: string }[];
  children?: ReactNode;
}

export function ModulePage({ eyebrow, title, description, cta, features, children }: ModulePageProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{eyebrow}</div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
          </div>
          {cta && (
            <button
              onClick={cta.onClick}
              className="rounded-xl bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground glow-violet"
            >
              {cta.label}
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-6 flex items-center gap-3">
          <span className="text-accent text-lg">✦</span>
          <div className="text-sm">
            <span className="font-semibold">Module en préparation.</span>{" "}
            <span className="text-muted-foreground">
              L'interface fonctionne — les données réelles arriveront lors de l'approfondissement de ce module.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="text-accent text-lg mb-2">{f.icon ?? "◆"}</div>
              <div className="font-semibold">{f.title}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {children}
      </main>
    </div>
  );
}
