import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion · OFM OS" },
      { name: "description", content: "Connectez-vous à votre OFM OS." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Auth Lovable Cloud branché à l'étape suivante. Pour l'instant : démo dashboard.
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 bg-aurora" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="rounded-3xl glass shadow-elevated p-8">
          <h1 className="font-display text-2xl font-bold text-center">
            {mode === "signin" ? "Bon retour" : "Créez votre OFM OS"}
          </h1>
          <p className="mt-2 text-sm text-center text-muted-foreground">
            {mode === "signin"
              ? "Connectez-vous pour reprendre où vous étiez."
              : "14 jours d'essai, sans carte bancaire."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button className="rounded-xl glass border border-border/60 px-3 py-2.5 text-sm hover:bg-white/10 transition">
              Google
            </button>
            <button className="rounded-xl glass border border-border/60 px-3 py-2.5 text-sm hover:bg-white/10 transition">
              Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou avec votre email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <Field label="Nom complet" type="text" placeholder="Alex Martin" />
            )}
            <Field label="Email" type="email" placeholder="vous@agence.com" />
            <Field label="Mot de passe" type="password" placeholder="••••••••" />

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-violet transition-all hover:scale-[1.01]"
            >
              {mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  className="text-foreground hover:text-accent transition"
                  onClick={() => setMode("signup")}
                >
                  S'inscrire
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button
                  className="text-foreground hover:text-accent transition"
                  onClick={() => setMode("signin")}
                >
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl bg-surface-elevated border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition placeholder:text-muted-foreground/60"
      />
    </label>
  );
}
