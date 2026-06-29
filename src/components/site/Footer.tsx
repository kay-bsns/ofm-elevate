import { Logo } from "./Logo";

const cols = [
  {
    title: "Plateforme",
    links: ["Modules", "IA Copilot", "Automatisations", "Marketplace", "Tarifs"],
  },
  {
    title: "Ressources",
    links: ["Académie", "Documentation", "Templates", "SOPs", "Communauté"],
  },
  {
    title: "Entreprise",
    links: ["À propos", "Carrières", "Contact", "Presse", "Sécurité"],
  },
  {
    title: "Légal",
    links: ["Conditions", "Confidentialité", "DPA", "Statut"],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              L'OS de référence pour lancer, gérer et scaler une agence OFM.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold tracking-widest text-foreground uppercase">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} OFM OS. Tous droits réservés.</div>
          <div>Fait pour les fondateurs d'agences ambitieux.</div>
        </div>
      </div>
    </footer>
  );
}
