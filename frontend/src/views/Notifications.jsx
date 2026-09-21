import { AlertsPanel } from '../ui/AlertsPanel.jsx';

export function Notifications() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">In-app Notifications / Alerts</h2>
        <p className="text-sm text-slate-500">Delayed projects, missing reports, monitoring risks, and budget alerts.</p>
      </div>
      <AlertsPanel />
    </div>
  );
}
