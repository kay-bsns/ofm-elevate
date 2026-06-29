import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { label: "Plateforme", href: "#platform" },
  { label: "Modules", href: "#modules" },
  { label: "IA", href: "#ai" },
  { label: "Tarifs", href: "#pricing" },
  { label: "Académie", href: "#academy" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-300 ${
            scrolled ? "glass shadow-elevated" : "bg-transparent"
          }`}
        >
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden sm:inline-flex px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.03] hover:glow-violet"
            >
              Démarrer
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
