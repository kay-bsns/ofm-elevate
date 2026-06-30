import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ALL_ROLES: AppRole[] = ["founder", "manager", "chatter"];

export const Route = createFileRoute("/_authenticated/admin/roles")({
  head: () => ({
    meta: [
      { title: "Administration · Rôles · OFM OS" },
      { name: "description", content: "Gérez les rôles et permissions de votre équipe." },
    ],
  }),
  component: AdminRolesPage,
});

type ProfileRow = { id: string; email: string | null; full_name: string | null; avatar_url: string | null };
type UserRoleRow = { user_id: string; role: AppRole };
type LogRow = {
  id: string;
  target_user_id: string;
  role: AppRole;
  action: "granted" | "revoked";
  changed_by: string | null;
  created_at: string;
};

function AdminRolesPage() {
  const qc = useQueryClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [isFounder, setIsFounder] = useState<boolean | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setMeId(uid);
      if (!uid) return setIsFounder(false);
      const { data: rows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "founder");
      setIsFounder((rows?.length ?? 0) > 0);
    });
  }, []);

  const profilesQ = useQuery({
    queryKey: ["admin", "profiles"],
    enabled: isFounder === true,
    queryFn: async (): Promise<ProfileRow[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rolesQ = useQuery({
    queryKey: ["admin", "user_roles"],
    enabled: isFounder === true,
    queryFn: async (): Promise<UserRoleRow[]> => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data ?? [];
    },
  });

  const logsQ = useQuery({
    queryKey: ["admin", "role_logs", selectedUser ?? "all"],
    enabled: isFounder === true,
    queryFn: async (): Promise<LogRow[]> => {
      let q = supabase
        .from("role_change_logs")
        .select("id, target_user_id, role, action, changed_by, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (selectedUser) q = q.eq("target_user_id", selectedUser);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const rolesByUser = useMemo(() => {
    const map = new Map<string, Set<AppRole>>();
    for (const r of rolesQ.data ?? []) {
      if (!map.has(r.user_id)) map.set(r.user_id, new Set());
      map.get(r.user_id)!.add(r.role);
    }
    return map;
  }, [rolesQ.data]);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of profilesQ.data ?? []) m.set(p.id, p.full_name || p.email || p.id.slice(0, 8));
    return m;
  }, [profilesQ.data]);

  const grant = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user_roles"] });
      qc.invalidateQueries({ queryKey: ["admin", "role_logs"] });
      toast.success("Rôle attribué");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user_roles"] });
      qc.invalidateQueries({ queryKey: ["admin", "role_logs"] });
      toast.success("Rôle révoqué");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isFounder === null) {
    return (
      <Shell>
        <div className="p-8 text-sm text-muted-foreground">Chargement…</div>
      </Shell>
    );
  }

  if (!isFounder) {
    return (
      <Shell>
        <div className="p-10">
          <div className="max-w-md rounded-2xl glass p-6">
            <h1 className="font-display text-xl font-bold">Accès restreint</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seuls les comptes <span className="text-foreground">founder</span> peuvent gérer les rôles
              et permissions.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="px-8 py-6 border-b border-border/60 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Administration
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">Rôles & permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Attribuez ou révoquez les rôles de votre équipe. Chaque modification est tracée.
          </p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Legend role="founder" label="Accès complet" />
          <Legend role="manager" label="Gestion opérations" />
          <Legend role="chatter" label="Conversations" />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 p-8">
        {/* Users table */}
        <section className="rounded-2xl glass overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="font-medium text-sm">
              Utilisateurs <span className="text-muted-foreground">({profilesQ.data?.length ?? 0})</span>
            </div>
            {selectedUser && (
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                Réinitialiser le filtre
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="text-left font-medium px-5 py-3">Utilisateur</th>
                  <th className="text-left font-medium px-5 py-3">Rôles</th>
                  <th className="text-right font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(profilesQ.data ?? []).map((p) => {
                  const userRoles = rolesByUser.get(p.id) ?? new Set<AppRole>();
                  const isSelf = p.id === meId;
                  const isSelected = selectedUser === p.id;
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-border/40 transition ${
                        isSelected ? "bg-primary/5" : "hover:bg-white/5"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setSelectedUser(isSelected ? null : p.id)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                            {(p.full_name || p.email || "?").slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">
                              {p.full_name || "—"}
                              {isSelf && (
                                <span className="ml-2 text-[10px] text-accent">vous</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{p.email}</div>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {[...userRoles].map((r) => (
                            <RoleBadge key={r} role={r} />
                          ))}
                          {userRoles.size === 0 && (
                            <span className="text-xs text-muted-foreground">Aucun rôle</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          {ALL_ROLES.map((r) => {
                            const has = userRoles.has(r);
                            const disabled =
                              (isSelf && r === "founder" && has) ||
                              grant.isPending ||
                              revoke.isPending;
                            return (
                              <button
                                key={r}
                                disabled={disabled}
                                onClick={() =>
                                  has
                                    ? revoke.mutate({ user_id: p.id, role: r })
                                    : grant.mutate({ user_id: p.id, role: r })
                                }
                                className={`text-[11px] px-2.5 py-1 rounded-md border transition disabled:opacity-40 ${
                                  has
                                    ? "border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
                                    : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                                title={has ? `Révoquer ${r}` : `Attribuer ${r}`}
                              >
                                {has ? "−" : "+"} {r}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {profilesQ.isLoading && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Chargement…
                    </td>
                  </tr>
                )}
                {!profilesQ.isLoading && (profilesQ.data?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Aucun utilisateur.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* History */}
        <section className="rounded-2xl glass overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60">
            <div className="font-medium text-sm">Historique</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {selectedUser
                ? `Filtré sur ${nameById.get(selectedUser) ?? selectedUser.slice(0, 8)}`
                : "100 dernières modifications"}
            </div>
          </div>
          <div className="max-h-[640px] overflow-y-auto divide-y divide-border/40">
            {(logsQ.data ?? []).map((l) => (
              <div key={l.id} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        l.action === "granted"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {l.action === "granted" ? "attribué" : "révoqué"}
                    </span>
                    <RoleBadge role={l.role} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(l.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">
                  Pour{" "}
                  <span className="text-foreground">
                    {nameById.get(l.target_user_id) ?? l.target_user_id.slice(0, 8)}
                  </span>{" "}
                  · par{" "}
                  <span className="text-foreground">
                    {l.changed_by
                      ? (nameById.get(l.changed_by) ?? l.changed_by.slice(0, 8))
                      : "système"}
                  </span>
                </div>
              </div>
            ))}
            {logsQ.isLoading && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">Chargement…</div>
            )}
            {!logsQ.isLoading && (logsQ.data?.length ?? 0) === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Aucune modification enregistrée.
              </div>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: AppRole }) {
  const styles: Record<AppRole, string> = {
    founder: "bg-accent/15 text-accent border-accent/30",
    manager: "bg-primary/15 text-primary border-primary/30",
    chatter: "bg-white/5 text-foreground border-border",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function Legend({ role, label }: { role: AppRole; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <RoleBadge role={role} />
      <span>{label}</span>
    </div>
  );
}
