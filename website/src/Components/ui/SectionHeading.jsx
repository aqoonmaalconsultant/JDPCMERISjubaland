function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}) {
  const alignmentClasses =
    align === "center"
      ? "mx-auto max-w-3xl text-center"
      : "max-w-3xl text-left";

  return (
    <div className={alignmentClasses}>
      {eyebrow && (
        <p
          className={[
            "text-sm font-bold uppercase tracking-[0.2em]",
            light ? "text-emerald-200" : "text-emerald-700",
          ].join(" ")}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={[
          "mt-3 text-3xl font-bold leading-tight sm:text-4xl",
          light ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {title}
      </h2>

      {description && (
        <p
          className={[
            "mt-4 text-lg leading-8",
            light ? "text-emerald-100/80" : "text-slate-600",
          ].join(" ")}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;