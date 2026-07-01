import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
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

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead", active: "Actif", vip: "VIP", whale: "Whale", churned: "Churn",
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

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link to="/models" className="hover:text-foreground">Modèles</Link>
          <span>/</span>
          <span>{model?.stage_name ?? "…"}</span>
        </div>
        <div className="flex items-start justify-between mb-8">
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
          <CreateFanDialog modelId={modelId} />
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="col-span-4">Fan</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-2 text-right">LTV</div>
            <div className="col-span-2">Dernier achat</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Chargement…</div>
          ) : fans.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Aucun fan pour l'instant — ajoutez-en un pour commencer.
            </div>
          ) : (
            fans.map((f: any) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
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
                  {f.last_purchase_at ? new Date(f.last_purchase_at).toLocaleDateString() : "—"}
                </div>
                <div className="col-span-2 text-right text-xs text-accent">Ouvrir →</div>
              </button>
            ))
          )}
        </div>
      </main>

      <FanDrawer fan={selected} modelId={modelId} onClose={() => setSelected(null)} />
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
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function CreateFanDialog({ modelId }: { modelId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ handle: "", display_name: "", country: "", language: "en", status: "lead" as const });
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
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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

  const addMut = useMutation({
    mutationFn: () => addInter({ data: {
      fan_id: fan!.id, model_id: modelId, kind,
      content: msg || undefined,
      amount: amount === "" ? undefined : Number(amount),
    }}),
    onSuccess: () => {
      toast.success("Ajouté");
      setMsg(""); setAmount("");
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
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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
                <div className="flex gap-2 mb-2">
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
                {suggestions && (
                  <pre className="mt-2 whitespace-pre-wrap text-xs font-sans text-foreground/90 bg-black/30 rounded-lg p-3">{suggestions}</pre>
                )}
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
                <Button className="w-full mt-2 bg-gradient-primary text-primary-foreground" disabled={addMut.isPending} onClick={() => addMut.mutate()}>
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
