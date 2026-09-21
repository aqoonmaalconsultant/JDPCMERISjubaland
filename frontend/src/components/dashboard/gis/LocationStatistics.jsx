import { MapPin, CheckCircle, Clock3, XCircle } from "lucide-react";
import { useLocationStatistics } from "../../hooks/useProjectLocations";

export default function LocationStatistics() {
  const {
    data,
    isLoading,
  } = useLocationStatistics();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border bg-slate-100"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Locations",
      value: data?.totalLocations ?? 0,
      icon: MapPin,
      color: "bg-blue-500",
    },
    {
      title: "Active",
      value: data?.activeLocations ?? 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Completed",
      value: data?.completedLocations ?? 0,
      icon: Clock3,
      color: "bg-purple-500",
    },
    {
      title: "Inactive",
      value: data?.inactiveLocations ?? 0,
      icon: XCircle,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {card.value}
                </h2>
              </div>

              <div
                className={`${card.color} rounded-full p-3 text-white`}
              >
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}