import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  addInteraction, aiSuggestReply, aiSummarizeFan, createFan,
  getModel, listFans, listInteractions, updateFanStatus,
} from "@/lib/crm.functions";

export const Route = createFileRoute("/_authenticated/models/$modelId")({
  head: () => ({ meta: [{ title: "CRM Modèle · OFM OS" }] }),
  component: ModelDetailPage,
});

const STATUS_ORDER = ["lead", "active", "vip", "whale", "churned"] as const;
type Status = typeof STATUS_ORDER[number];

const STATUS_LABELS: Record<Status, string> = {
  lead: "Nouveau", active: "Actif", vip: "VIP", whale: "Whale", churned: "Churn / à réactiver",
};

const STATUS_TINTS: Record<Status, string> = {
  lead: "border-white/20 bg-white/5",
  active: "border-emerald-500/40 bg-emerald-500/5",
  vip: "border-primary/40 bg-primary/5",
  whale: "border-accent/40 bg-accent/5",
  churned: "border-destructive/40 bg-destructive/5",
};

function ModelDetailPage() {
  const { modelId } = Route.useParams();
  const getModelFn = useServerFn(getModel);
  const listFansFn = useServerFn(listFans);
  const { data: model } = useQuery({
    queryKey: ["model", modelId],
    queryFn: () => getModelFn({ data: { id: modelId } }),
  });
  const { data: fans = [], isLoading } = useQuery({
    queryKey: ["fans", modelId],
    queryFn: () => listFansFn({ data: { model_id: modelId } }),
  });
  const [selected, setSelected] = useState<any | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [ltvMin, setLtvMin] = useState<string>("");
  const [ltvMax, setLtvMax] = useState<string>("");
  const [tagFilter, setTagFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [staleDays, setStaleDays] = useState<string>(""); // dernière interaction > N jours
  const [sortBy, setSortBy] = useState<"ltv_desc" | "ltv_asc" | "recent" | "stale" | "handle">("ltv_desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = ltvMin ? Number(ltvMin) : null;
    const max = ltvMax ? Number(ltvMax) : null;
    const tag = tagFilter.trim().toLowerCase();
    const lang = languageFilter.trim().toLowerCase();
    const staleMs = staleDays ? Number(staleDays) * 86400000 : null;
    const now = Date.now();
    let out = (fans as any[]).filter((f) => {
      if (q && !`${f.handle} ${f.display_name ?? ""} ${(f.tags ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (min !== null && Number(f.lifetime_value) < min) return false;
      if (max !== null && Number(f.lifetime_value) > max) return false;
      if (tag && !(f.tags ?? []).some((t: string) => t.toLowerCase().includes(tag))) return false;
      if (lang && (f.language ?? "").toLowerCase() !== lang) return false;
      if (staleMs !== null) {
        const last = f.last_message_at ? new Date(f.last_message_at).getTime() : 0;
        if (now - last < staleMs) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      switch (sortBy) {
        case "ltv_asc": return Number(a.lifetime_value) - Number(b.lifetime_value);
        case "handle": return a.handle.localeCompare(b.handle);
        case "recent": {
          const ta = new Date(a.last_message_at ?? a.created_at).getTime();
          const tb = new Date(b.last_message_at ?? b.created_at).getTime();
          return tb - ta;
        }
        case "stale": {
          const ta = new Date(a.last_message_at ?? a.created_at).getTime();
          const tb = new Date(b.last_message_at ?? b.created_at).getTime();
          return ta - tb;
        }
        default: return Number(b.lifetime_value) - Number(a.lifetime_value);
      }
    });
    return out;
  }, [fans, search, statusFilter, ltvMin, ltvMax, tagFilter, languageFilter, staleDays, sortBy]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link to="/models" className="hover:text-foreground">Modèles</Link>
          <span>/</span>
          <span>{model?.stage_name ?? "…"}</span>
        </div>
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-semibold">
              {model?.stage_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{model?.stage_name}</h1>
              <p className="text-sm text-muted-foreground">
                {model?.niche || "—"} · Objectif ${Number(model?.monthly_goal ?? 0).toLocaleString()}/mois
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-border/60 p-0.5 flex text-xs">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1.5 rounded-md transition ${view === "kanban" ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
              >Kanban</button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 rounded-md transition ${view === "list" ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
              >Liste</button>
            </div>
            <CreateFanDialog modelId={modelId} />
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-4 mb-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="col-span-2" />
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="LTV min $" value={ltvMin} onChange={(e) => setLtvMin(e.target.value)} type="number" />
          <Input placeholder="LTV max $" value={ltvMax} onChange={(e) => setLtvMax(e.target.value)} type="number" />
          <Input placeholder="Tag" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} />
          <Input placeholder="Langue (en, fr…)" value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} />
          <Input placeholder="Inactifs depuis N j" value={staleDays} onChange={(e) => setStaleDays(e.target.value)} type="number" />
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="col-span-2 md:col-span-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ltv_desc">LTV ↓</SelectItem>
              <SelectItem value="ltv_asc">LTV ↑</SelectItem>
              <SelectItem value="recent">Interaction récente</SelectItem>
              <SelectItem value="stale">Plus inactifs</SelectItem>
              <SelectItem value="handle">Nom (A→Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="p-10 text-sm text-muted-foreground">Chargement…</div>
        ) : view === "kanban" ? (
          <KanbanBoard fans={filtered} modelId={modelId} onOpen={setSelected} />
        ) : (
          <FansList fans={filtered} onOpen={setSelected} />
        )}
      </main>

      <FanDrawer fan={selected} modelId={modelId} onClose={() => setSelected(null)} />
    </div>
  );
}

// ============= Kanban =============
function KanbanBoard({ fans, modelId, onOpen }: { fans: any[]; modelId: string; onOpen: (f: any) => void }) {
  const qc = useQueryClient();
  const setStatus = useServerFn(updateFanStatus);
  const [dragOver, setDragOver] = useState<Status | null>(null);

  const mut = useMutation({
    mutationFn: (p: { id: string; status: Status }) => setStatus({ data: p }),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: ["fans", modelId] });
      const prev = qc.getQueryData<any[]>(["fans", modelId]);
      qc.setQueryData<any[]>(["fans", modelId], (old = []) =>
        old.map((f) => (f.id === p.id ? { ...f, status: p.status } : f)),
      );
      return { prev };
    },
    onError: (_e, _p, ctx) => {
      if (ctx?.prev) qc.setQueryData(["fans", modelId], ctx.prev);
      toast.error("Impossible de déplacer le fan");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["fans", modelId] }),
  });

  const grouped = useMemo(() => {
    const g: Record<Status, any[]> = { lead: [], active: [], vip: [], whale: [], churned: [] };
    for (const f of fans) g[f.status as Status]?.push(f);
    return g;
  }, [fans]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {STATUS_ORDER.map((s) => {
        const items = grouped[s];
        const total = items.reduce((sum, f) => sum + Number(f.lifetime_value ?? 0), 0);
        return (
          <div
            key={s}
            onDragOver={(e) => { e.preventDefault(); setDragOver(s); }}
            onDragLeave={() => setDragOver((v) => (v === s ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const id = e.dataTransfer.getData("text/fan-id");
              const from = e.dataTransfer.getData("text/fan-status");
              if (id && from !== s) mut.mutate({ id, status: s });
            }}
            className={`rounded-2xl border ${STATUS_TINTS[s]} ${dragOver === s ? "ring-2 ring-primary" : ""} p-3 min-h-[60vh] flex flex-col`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest">{STATUS_LABELS[s]}</div>
                <div className="text-[10px] text-muted-foreground">{items.length} fans · ${total.toFixed(0)} LTV</div>
              </div>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {items.length === 0 && (
                <div className="text-[11px] text-muted-foreground italic px-2 py-6 text-center border border-dashed border-border/40 rounded-lg">
                  Glissez un fan ici
                </div>
              )}
              {items.map((f) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/fan-id", f.id);
                    e.dataTransfer.setData("text/fan-status", f.status);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => onOpen(f)}
                  className="cursor-grab active:cursor-grabbing rounded-xl border border-border/50 bg-background/60 hover:bg-background/90 p-3 text-left transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold">
                      {f.handle[0]?.toUpperCase()}
                    </div>
                    <div className="text-sm font-medium truncate">@{f.handle}</div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">{f.display_name || f.country || "—"}</span>
                    <span className="font-mono text-accent">${Number(f.lifetime_value).toFixed(0)}</span>
                  </div>
                  {(f.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(f.tags as string[]).slice(0, 3).map((t) => (
                        <span key={t} className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FansList({ fans, onOpen }: { fans: any[]; onOpen: (f: any) => void }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground">
        <div className="col-span-4">Fan</div>
        <div className="col-span-2">Statut</div>
        <div className="col-span-2 text-right">LTV</div>
        <div className="col-span-2">Dernière interaction</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {fans.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">Aucun fan ne correspond aux filtres.</div>
      ) : fans.map((f: any) => (
        <button
          key={f.id}
          onClick={() => onOpen(f)}
          className="w-full grid grid-cols-12 gap-2 items-center px-5 py-3 border-b border-border/40 text-sm hover:bg-white/5 text-left"
        >
          <div className="col-span-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
              {f.handle[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-medium">@{f.handle}</div>
              <div className="text-[11px] text-muted-foreground">{f.display_name || f.country || ""}</div>
            </div>
          </div>
          <div className="col-span-2"><StatusBadge status={f.status} /></div>
          <div className="col-span-2 text-right font-mono">${Number(f.lifetime_value).toFixed(2)}</div>
          <div className="col-span-2 text-xs text-muted-foreground">
            {f.last_message_at ? new Date(f.last_message_at).toLocaleDateString() : "—"}
          </div>
          <div className="col-span-2 text-right text-xs text-accent">Ouvrir →</div>
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    lead: "bg-white/10 text-muted-foreground",
    active: "bg-emerald-500/20 text-emerald-300",
    vip: "bg-primary/20 text-primary",
    whale: "bg-accent/20 text-accent",
    churned: "bg-destructive/20 text-destructive",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${map[status] ?? ""}`}>
      {STATUS_LABELS[status as Status] ?? status}
    </span>
  );
}

function CreateFanDialog({ modelId }: { modelId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ handle: "", display_name: "", country: "", language: "en", status: "lead" as Status });
  const qc = useQueryClient();
  const create = useServerFn(createFan);
  const mut = useMutation({
    mutationFn: () => create({ data: { model_id: modelId, ...form, tags: [] } }),
    onSuccess: () => {
      toast.success("Fan ajouté");
      qc.invalidateQueries({ queryKey: ["fans", modelId] });
      setOpen(false);
      setForm({ handle: "", display_name: "", country: "", language: "en", status: "lead" });
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-primary-foreground">+ Nouveau fan</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader><DialogTitle>Nouveau fan</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Handle *</Label>
            <Input value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} placeholder="username" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nom affiché</Label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Pays</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="US" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Langue</Label>
              <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Statut</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary text-primary-foreground">
              {mut.isPending ? "Ajout…" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============= Drawer =============
function parseSuggestions(raw: string): string[] {
  if (!raw) return [];
  // Split on lines starting with 1. / 2) / - etc.
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: string[] = [];
  let buf = "";
  const starter = /^(\d+[.)]|[-•*])\s+/;
  for (const l of lines) {
    if (starter.test(l)) {
      if (buf) out.push(buf.trim());
      buf = l.replace(starter, "");
    } else {
      buf = buf ? `${buf} ${l}` : l;
    }
  }
  if (buf) out.push(buf.trim());
  return out.slice(0, 5);
}

function FanDrawer({ fan, modelId, onClose }: { fan: any | null; modelId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const listInter = useServerFn(listInteractions);
  const addInter = useServerFn(addInteraction);
  const suggest = useServerFn(aiSuggestReply);
  const summarize = useServerFn(aiSummarizeFan);
  const setStatus = useServerFn(updateFanStatus);

  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions", fan?.id],
    queryFn: () => listInter({ data: { fan_id: fan!.id } }),
    enabled: !!fan,
  });

  const [msg, setMsg] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [kind, setKind] = useState<"message_out" | "ppv_sent" | "ppv_purchased" | "tip" | "note">("message_out");
  const [suggestions, setSuggestions] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [goal, setGoal] = useState<"engage" | "upsell_ppv" | "tip" | "reactivate">("engage");

  const parsed = useMemo(() => parseSuggestions(suggestions), [suggestions]);

  const addMut = useMutation({
    mutationFn: (payload: { content?: string; amount?: number; kind: any }) => addInter({ data: {
      fan_id: fan!.id, model_id: modelId, kind: payload.kind,
      content: payload.content, amount: payload.amount,
    }}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interactions", fan?.id] });
      qc.invalidateQueries({ queryKey: ["fans", modelId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const suggestMut = useMutation({
    mutationFn: () => suggest({ data: { fan_id: fan!.id, goal } }),
    onSuccess: (r) => setSuggestions(r.suggestions),
    onError: (e: any) => toast.error(e.message),
  });
  const summMut = useMutation({
    mutationFn: () => summarize({ data: { fan_id: fan!.id } }),
    onSuccess: (r) => {
      setSummary(r.summary);
      qc.invalidateQueries({ queryKey: ["fans", modelId] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const statusMut = useMutation({
    mutationFn: (s: any) => setStatus({ data: { id: fan!.id, status: s } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fans", modelId] }),
  });

  async function useSuggestion(text: string) {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(text);
    } catch { /* ignore clipboard errors */ }
    await addMut.mutateAsync({ kind: "message_out", content: text });
    toast.success("Réponse copiée et enregistrée dans la timeline");
  }

  return (
    <Sheet open={!!fan} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-border/60">
        {fan && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center font-semibold">
                  {fan.handle[0]?.toUpperCase()}
                </span>
                <span>
                  @{fan.handle}
                  <div className="text-xs font-normal text-muted-foreground">LTV ${Number(fan.lifetime_value).toFixed(2)}</div>
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Statut</div>
                <Select value={fan.status} onValueChange={(v) => statusMut.mutate(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span className="text-accent">✦</span> Copilot IA
                  </div>
                  <Button size="sm" variant="outline" disabled={summMut.isPending} onClick={() => summMut.mutate()}>
                    {summMut.isPending ? "…" : "Résumé"}
                  </Button>
                </div>
                {(summary || fan.ai_summary) && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap mb-3">{summary || fan.ai_summary}</p>
                )}
                <div className="flex gap-2 mb-3">
                  <Select value={goal} onValueChange={(v: any) => setGoal(v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engage">Engager</SelectItem>
                      <SelectItem value="upsell_ppv">Upsell PPV</SelectItem>
                      <SelectItem value="tip">Solliciter un tip</SelectItem>
                      <SelectItem value="reactivate">Réactiver</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={suggestMut.isPending} onClick={() => suggestMut.mutate()} className="bg-gradient-primary text-primary-foreground">
                    {suggestMut.isPending ? "Génération…" : "Suggérer 3 réponses"}
                  </Button>
                </div>
                {parsed.length > 0 ? (
                  <div className="space-y-2">
                    {parsed.map((s, i) => (
                      <div key={i} className="rounded-lg border border-border/50 bg-background/40 p-3">
                        <div className="text-xs whitespace-pre-wrap mb-2">{s}</div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setMsg(s)}>Éditer</Button>
                          <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => useSuggestion(s)}>
                            Utiliser
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions ? (
                  <pre className="mt-2 whitespace-pre-wrap text-xs font-sans text-foreground/90 bg-black/30 rounded-lg p-3">{suggestions}</pre>
                ) : null}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Nouvelle interaction</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Select value={kind} onValueChange={(v: any) => setKind(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message_out">Message envoyé</SelectItem>
                      <SelectItem value="ppv_sent">PPV envoyé</SelectItem>
                      <SelectItem value="ppv_purchased">PPV acheté</SelectItem>
                      <SelectItem value="tip">Tip reçu</SelectItem>
                      <SelectItem value="note">Note interne</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Montant $" value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <Textarea rows={3} placeholder="Contenu…" value={msg} onChange={(e) => setMsg(e.target.value)} />
                <Button
                  className="w-full mt-2 bg-gradient-primary text-primary-foreground"
                  disabled={addMut.isPending}
                  onClick={() => {
                    addMut.mutate({
                      kind,
                      content: msg || undefined,
                      amount: amount === "" ? undefined : Number(amount),
                    }, {
                      onSuccess: () => { toast.success("Ajouté"); setMsg(""); setAmount(""); },
                    });
                  }}
                >
                  {addMut.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Timeline</div>
                <div className="space-y-2">
                  {interactions.length === 0 && (
                    <div className="text-xs text-muted-foreground italic">Aucune interaction pour l'instant.</div>
                  )}
                  {interactions.map((i: any) => (
                    <div key={i.id} className="rounded-lg border border-border/50 bg-background/40 p-3">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest">
                        <span>{i.kind}</span>
                        <span>{new Date(i.occurred_at).toLocaleString()}</span>
                      </div>
                      {i.content && <div className="text-sm mt-1">{i.content}</div>}
                      {i.amount != null && <div className="text-xs text-accent mt-1">+ ${Number(i.amount).toFixed(2)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
