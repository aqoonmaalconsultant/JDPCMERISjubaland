import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function PrimaryLink({
  to,
  children,
  variant = "primary",
  showArrow = true,
  className = "",
}) {
  const variantClasses = {
    primary:
      "bg-emerald-800 text-white hover:bg-emerald-900 focus:ring-emerald-700",
    secondary:
      "border border-slate-300 bg-white text-slate-800 hover:border-emerald-700 hover:text-emerald-800 focus:ring-emerald-700",
    gold: "bg-amber-400 text-slate-950 hover:bg-amber-300 focus:ring-amber-400",
    light:
      "border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:ring-white",
  };

  return (
    <Link
      to={to}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2",
        variantClasses[variant] || variantClasses.primary,
        className,
      ].join(" ")}
    >
      {children}

      {showArrow && <ArrowRight size={18} />}
    </Link>
  );
}

export default PrimaryLink;