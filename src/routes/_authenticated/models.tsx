import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { createModel, listModels } from "@/lib/crm.functions";

export const Route = createFileRoute("/_authenticated/models")({
  head: () => ({ meta: [{ title: "Modèles · OFM OS" }] }),
  component: ModelsPage,
});

function ModelsPage() {
  const fetchModels = useServerFn(listModels);
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: () => fetchModels(),
  });

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Modèles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez votre roster de créatrices, leurs objectifs et leur CRM.
            </p>
          </div>
          <CreateModelDialog />
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : models.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-12 text-center">
            <div className="text-4xl mb-3">★</div>
            <h2 className="font-semibold">Aucune modèle</h2>
            <p className="text-sm text-muted-foreground mt-1">Ajoutez votre première créatrice pour démarrer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {models.map((m: any) => (
              <Link
                key={m.id}
                to="/models/$modelId"
                params={{ modelId: m.id }}
                className="group rounded-2xl border border-border/60 bg-card/40 p-5 hover:border-primary/50 hover:bg-card/70 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center font-semibold">
                    {m.stage_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{m.stage_name}</div>
                    <div className="text-xs text-muted-foreground">{m.niche || "—"}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Stat label="Statut" value={m.status} />
                  <Stat label="Commission" value={`${m.commission_rate}%`} />
                  <Stat label="Objectif" value={`$${Number(m.monthly_goal ?? 0).toLocaleString()}`} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function CreateModelDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ stage_name: "", niche: "", onlyfans_url: "", commission_rate: 20, monthly_goal: 0 });
  const qc = useQueryClient();
  const create = useServerFn(createModel);
  const mut = useMutation({
    mutationFn: (payload: typeof form) => create({ data: payload }),
    onSuccess: () => {
      toast.success("Modèle créée");
      qc.invalidateQueries({ queryKey: ["models"] });
      setOpen(false);
      setForm({ stage_name: "", niche: "", onlyfans_url: "", commission_rate: 20, monthly_goal: 0 });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-primary-foreground">+ Nouvelle modèle</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader><DialogTitle>Nouvelle modèle</DialogTitle></DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }}
        >
          <Field label="Nom de scène *">
            <Input value={form.stage_name} onChange={(e) => setForm({ ...form, stage_name: e.target.value })} required />
          </Field>
          <Field label="Niche">
            <Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="GFE, cosplay, fitness…" />
          </Field>
          <Field label="URL OnlyFans">
            <Input type="url" value={form.onlyfans_url} onChange={(e) => setForm({ ...form, onlyfans_url: e.target.value })} placeholder="https://onlyfans.com/…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Commission %">
              <Input type="number" min={0} max={100} value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })} />
            </Field>
            <Field label="Objectif mensuel ($)">
              <Input type="number" min={0} value={form.monthly_goal} onChange={(e) => setForm({ ...form, monthly_goal: Number(e.target.value) })} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary text-primary-foreground">
              {mut.isPending ? "Création…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
