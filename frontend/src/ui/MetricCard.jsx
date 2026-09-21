export function MetricCard({ label, value, accent = 'bg-civic' }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-4 h-1.5 w-16 rounded ${accent}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
