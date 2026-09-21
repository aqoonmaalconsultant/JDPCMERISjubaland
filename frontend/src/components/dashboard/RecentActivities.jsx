import {
  Clock3,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";

export default function RecentActivities({ data }) {
  const activities = data?.recent || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Recent Activities
        </h2>

        <p className="text-sm text-slate-500">
          Latest updates across the system
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="py-10 text-center text-slate-500">
          No recent activities available.
        </div>
      ) : (
        <div className="space-y-4">

          {activities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-center gap-4">

                <div className="rounded-full bg-blue-100 p-3">
                  <FolderOpen
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {activity.projectName}
                  </h3>

                  <div className="mt-1 flex gap-2 text-sm">

                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-700">
                      <CheckCircle2 size={14} />
                      {activity.registrationStatus}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                      <Clock3 size={14} />
                      {activity.implementationStatus}
                    </span>

                  </div>
                </div>

              </div>

              <div className="text-sm text-slate-500">
                {new Date(activity.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}