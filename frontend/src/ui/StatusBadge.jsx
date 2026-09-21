const styles = {
  /*
   * Official Project implementation statuses
   */
  Planning:
    'bg-blue-50 text-blue-700 ring-blue-200',

  Active:
    'bg-amber-50 text-amber-700 ring-amber-200',

  'On Hold':
    'bg-purple-50 text-purple-700 ring-purple-200',

  Completed:
    'bg-emerald-50 text-emerald-700 ring-emerald-200',

  Cancelled:
    'bg-red-50 text-red-700 ring-red-200',

  /*
   * Existing JAIMS workflow statuses
   * retained for backward compatibility.
   */
  Implementation:
    'bg-emerald-50 text-emerald-700 ring-emerald-200',

  Monitoring:
    'bg-sky-50 text-sky-700 ring-sky-200',

  Procurement:
    'bg-amber-50 text-amber-700 ring-amber-200',

  Suspended:
    'bg-red-50 text-red-700 ring-red-200',
};

const fallbackStyle =
  'bg-slate-100 text-slate-700 ring-slate-200';

export function StatusBadge({
  status,
}) {
  const label =
    status || 'Unknown';

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-semibold ring-1 ${
        styles[status] ||
        fallbackStyle
      }`}
    >
      {label}
    </span>
  );
}