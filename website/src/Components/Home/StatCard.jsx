function StatCard({ title, value, description, icon: Icon }) {
  return (
    <article className="border-b border-slate-200 p-6 transition hover:bg-slate-50 md:border-r lg:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-800">
          <Icon size={24} />
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          JPMP
        </span>
      </div>

      <p className="mt-5 text-3xl font-bold text-slate-900">{value}</p>

      <h3 className="mt-1 font-semibold text-slate-800">{title}</h3>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </article>
  );
}

export default StatCard;