import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative h-8 w-8 rounded-lg bg-gradient-primary glow-violet transition-transform duration-300 group-hover:scale-110">
        <div className="absolute inset-[2px] rounded-[7px] bg-background flex items-center justify-center">
          <span className="font-display text-sm font-bold text-gradient">O</span>
        </div>
      </div>
      <span className="font-display text-lg font-semibold tracking-tight">
        OFM<span className="text-muted-foreground"> </span>
        <span className="text-gradient">OS</span>
      </span>
    </Link>
  );
}
