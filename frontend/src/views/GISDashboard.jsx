import LocationStatistics from "../components/gis/LocationStatistics";

export default function GISDashboard() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          GIS Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Geographic Information System
        </p>
      </div>

      <LocationStatistics />

    </div>
  );
}