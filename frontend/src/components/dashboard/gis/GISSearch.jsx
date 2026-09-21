import { Search, X } from "lucide-react";

export default function GISSearch({
  value,
  onChange,
  onClear,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="relative">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by Project Name, Organization, Ministry, Region, District..."
          className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-12 outline-none transition focus:border-civic"
        />

        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        ) : null}

      </div>

    </div>
  );
}