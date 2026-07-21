import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

const groups = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Overview", icon: "◉" },
      { to: "/inbox", label: "Inbox", icon: "✉", badge: 8 },
      { to: "/calendar", label: "Calendrier", icon: "◷" },
    ],
  },
  {
    label: "Opérations",
    items: [
      { to: "/models", label: "Modèles", icon: "★" },
      { to: "/crm", label: "CRM Fans", icon: "◈" },
      { to: "/chatters", label: "Chatters", icon: "◐" },
      { to: "/managers", label: "Managers", icon: "◆" },
    ],
  },
  {
    label: "Business",
    items: [
      { to: "/finance", label: "Finance", icon: "$" },
      { to: "/commissions", label: "Commissions", icon: "%" },
      { to: "/contracts", label: "Contrats", icon: "❖" },
      { to: "/analytics", label: "Analytics", icon: "◎" },
    ],
  },
  {
    label: "Croissance",
    items: [
      { to: "/recruitment", label: "Recrutement", icon: "◇" },
      { to: "/copilot", label: "Copilot IA", icon: "✦" },
      { to: "/automations", label: "Automatisations", icon: "⌘" },
      { to: "/academy", label: "Académie", icon: "✺" },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/admin/roles", label: "Rôles & permissions", icon: "⚿" },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <div className="p-5 border-b border-sidebar-border">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = pathname === it.to || pathname.startsWith(it.to + "/");
                return (
                  <Link
                    key={g.label + it.label}
                    to={it.to}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary/15 text-foreground border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-base ${active ? "text-accent" : ""}`}>{it.icon}</span>
                    <span className="flex-1">{it.label}</span>
                    {"badge" in it && it.badge ? (
                      <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-semibold">
                        {it.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-3">
        <div className="rounded-xl border-gradient p-4">
          <div className="text-xs font-semibold">Passez à Agency</div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Débloquez l'IA illimitée et le recrutement automatisé.
          </p>
          <button className="mt-3 w-full rounded-lg bg-gradient-primary py-2 text-xs font-semibold text-primary-foreground">
            Upgrade
          </button>
        </div>
        <button
          onClick={signOut}
          className="w-full rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
