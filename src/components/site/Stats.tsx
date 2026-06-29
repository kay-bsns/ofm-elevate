const stats = [
  { value: "$2.4B+", label: "Revenus traités par nos agences" },
  { value: "1,200+", label: "Agences actives" },
  { value: "62%", label: "Marge nette médiane" },
  { value: "11x", label: "Temps gagné vs Notion + Sheets" },
];

export function Stats() {
  return (
    <section className="relative py-20 border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl lg:text-5xl font-semibold text-gradient">{s.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
