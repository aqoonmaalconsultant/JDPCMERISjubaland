import { RotateCcw } from "lucide-react";

export default function GISFilters({
  filters,
  setFilters,
  regions = [],
  districts = [],
  ministries = [],
  donors = [],
}) {
  const update = (field) => (e) => {
    setFilters((current) => ({
      ...current,
      [field]: e.target.value,
      ...(field === "region"
        ? { district: "" }
        : {}),
    }));
  };

  const resetFilters = () => {
    setFilters({
      ministry: "",
      donor: "",
      region: "",
      district: "",
      sector: "",
      status: "",
      year: "",
    });
  };

  const filteredDistricts =
    filters.region === ""
      ? districts
      : districts.filter((district) => {
          const regionId =
            typeof district.region === "object"
              ? district.region?._id
              : district.region;

          return (
            String(regionId) ===
            String(filters.region)
          );
        });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <select
          value={filters.region}
          onChange={update("region")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
            All Regions
          </option>

          {regions.map((region) => (
            <option
              key={region._id}
              value={region._id}
            >
              {region.name}
            </option>
          ))}
        </select>

        <select
          value={filters.district}
          onChange={update("district")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
            All Districts
          </option>

          {filteredDistricts.map(
            (district) => (
              <option
                key={district._id}
                value={district._id}
              >
                {district.name}
              </option>
            )
          )}
        </select>

        <select
          value={filters.ministry}
          onChange={update("ministry")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
            All Ministries
          </option>

          {ministries.map(
            (ministry) => (
              <option
                key={ministry._id}
                value={ministry._id}
              >
                {ministry.name}
              </option>
            )
          )}
        </select>

        <select
          value={filters.donor}
          onChange={update("donor")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
            All Donors
          </option>

          {donors.map((donor) => (
            <option
              key={donor._id}
              value={donor._id}
            >
              {donor.name}
            </option>
          ))}
        </select>

        <select
          value={filters.sector}
          onChange={update("sector")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
            All Sectors
          </option>

          <option>Health</option>
          <option>Education</option>
          <option>WASH</option>
          <option>Infrastructure</option>
          <option>Agriculture</option>
          <option>Livelihoods</option>
          <option>Governance</option>
          <option>Protection</option>
          <option>Environment</option>
          <option>Energy</option>
          <option>Other</option>
        </select>

        <select
  value={filters.status}
  onChange={update("status")}
  className="rounded-lg border border-slate-300 px-3 py-2"
>
  <option value="">
    All Status
  </option>

  <option>Planning</option>
  <option>Active</option>
  <option>On Hold</option>
  <option>Completed</option>
  <option>Cancelled</option>
</select>

        <select
          value={filters.year}
          onChange={update("year")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
           All Years
          </option>

          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(
            (year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100"
        >
          <RotateCcw size={18} />

          Reset Filters
        </button>

      </div>

    </div>
  );
}